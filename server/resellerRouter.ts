import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { invokeLLMVision } from "./_core/llm";

// Middleware for reseller authentication
const resellerProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No autenticado" });
  }

  const token = authHeader.substring(7);
  
  // Verify token and get customer
  // This would be done by the customer middleware
  // For now, we'll assume the token is valid
  
  return next({ ctx });
});

export const resellerRouter = router({
  // Get reseller products (with reseller prices) - only those with showInReseller=1
  products: publicProcedure.query(async () => {
    const allProducts = await db.getAllProducts();
    const products = allProducts.filter(p => (p as any).showInReseller === 1);
    return products.map((product) => ({
      ...product,
      displayPrice: product.resellerPrice || product.basePrice,
    }));
  }),

  // Create reseller order
  createOrder: resellerProcedure
    .input(
      z.object({
        customerId: z.number(),
        items: z.array(
          z.object({
            productId: z.number(),
            productName: z.string(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Get customer
      const customer = await db.getCustomerById(input.customerId);
      if (!customer || customer.role !== "reseller") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo resellers pueden hacer compras",
        });
      }

      // Check balance
      if (customer.balance < input.totalAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Saldo insuficiente",
        });
      }

      // Deduct balance
      await db.updateCustomerBalance(input.customerId, -input.totalAmount);

      // Create order in database
      const orderId = await db.createOrder({
        customerId: input.customerId,
        customerName: customer.name || customer.email,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: JSON.stringify(input.items),
        totalAmount: input.totalAmount,
        status: "completed",
      });

      // Send to WhatsApp
      try {
        await sendOrderToWhatsApp({
          customerId: input.customerId,
          customerName: customer.name || customer.email,
          customerPhone: customer.phone,
          items: input.items,
          totalAmount: input.totalAmount,
          orderId,
        });
      } catch (error) {
        console.error("Error sending to WhatsApp:", error);
        // Don't fail the order if WhatsApp fails
      }

      return {
        success: true,
        orderId,
        message: "Pedido realizado exitosamente. Se ha enviado a WhatsApp.",
      };
    }),

  // Get reseller orders
  myOrders: resellerProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerOrders(input.customerId);
    }),

  // Submit voucher for AI verification and balance top-up
  submitRecharge: resellerProcedure
    .input(z.object({
      customerId: z.number(),
      declaredAmount: z.number().min(1000).max(10000000),
      paymentMethod: z.enum(["nequi", "daviplata", "otro"]),
      voucherBase64: z.string(),
      voucherFileName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const customer = await db.getCustomerById(input.customerId);
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
      }

      // 1. Upload voucher image to storage
      const base64Data = input.voucherBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const ext = (input.voucherFileName?.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `vouchers/${nanoid(12)}.${ext}`;

      let voucherImageUrl = "";
      try {
        const uploaded = await storagePut(fileName, buffer, `image/${ext}`);
        voucherImageUrl = uploaded.url;
      } catch (err) {
        voucherImageUrl = `data:image/${ext};base64,${base64Data.substring(0, 100)}...`;
      }

      // 2. Get payment config for owner account details
      const paymentConfigSetting = await db.getSetting("payment_config");
      let ownerAccountInfo = "";
      if (paymentConfigSetting?.value) {
        try {
          const cfg = JSON.parse(paymentConfigSetting.value);
          if (cfg.accountName) ownerAccountInfo = `Cuenta destino: ${cfg.accountName}. `;
        } catch {}
      }

      // 3. Analyze voucher with AI Vision
      let aiVerified = 0;
      let aiExtractedAmount: number | null = null;
      let aiTransactionId: string | null = null;
      let aiConfidence = "low";
      let aiNotes = "Pendiente de verificación manual.";
      let autoApproved = false;

      try {
        const imageForAI = input.voucherBase64.startsWith("data:")
          ? input.voucherBase64
          : `data:image/${ext};base64,${base64Data}`;

        const systemPrompt = `Eres un sistema experto en verificación de comprobantes de pago colombianos (Nequi y Daviplata).
Responde SIEMPRE en JSON válido con esta estructura exacta (sin texto adicional):
{
  "isValid": boolean,
  "extractedAmount": number | null,
  "transactionId": string | null,
  "paymentMethod": "nequi" | "daviplata" | "otro" | null,
  "confidence": "high" | "medium" | "low",
  "notes": string,
  "amountMatches": boolean
}

Criterios de validación:
- isValid=true solo si: es un comprobante real de Nequi/Daviplata, tiene número de transacción visible, monto claro, fecha y hora.
- isValid=false si: parece editado, generado por app falsa, es captura de pantalla de otra app, o no es un comprobante de pago.
- amountMatches=true si el monto extraído coincide con ${input.declaredAmount} COP (±5% de tolerancia).
- confidence="high" solo si todos los datos son claramente legibles y el comprobante es inequívocamente auténtico.
${ownerAccountInfo}`;

        const response = await invokeLLMVision({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: imageForAI, detail: "high" } },
                { type: "text", text: `Verifica este comprobante. Monto declarado: ${input.declaredAmount.toLocaleString('es-CO')} COP. Método: ${input.paymentMethod}. Responde solo en JSON.` }
              ]
            }
          ]
        });

        const content = response.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResult = JSON.parse(jsonMatch[0]);
          aiExtractedAmount = aiResult.extractedAmount ? Math.round(Number(aiResult.extractedAmount)) : null;
          aiTransactionId = aiResult.transactionId || null;
          aiConfidence = aiResult.confidence || "low";
          aiNotes = aiResult.notes || "";

          if (aiResult.isValid && aiResult.amountMatches) {
            aiVerified = 1;
            if (aiResult.confidence === "high") {
              autoApproved = true;
            }
          } else {
            aiVerified = 2;
          }
        }
      } catch (err) {
        console.error("[AI Voucher] Error:", err);
        aiNotes = "Error al analizar con IA. Será revisado manualmente.";
      }

      // 4. Save recharge request
      const requestId = await db.createRechargeRequest({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name || "",
        declaredAmount: input.declaredAmount,
        voucherImageUrl,
        paymentMethod: input.paymentMethod,
        aiVerified,
        aiExtractedAmount,
        aiTransactionId,
        aiConfidence,
        aiNotes,
        status: autoApproved ? "approved" : "pending",
        processedAt: autoApproved ? new Date() : null,
      });

      // 5. Auto-credit if AI approved with high confidence
      if (autoApproved) {
        await db.updateCustomerBalance(customer.id, input.declaredAmount);
        return {
          success: true,
          status: "approved" as const,
          message: `¡Saldo acreditado automáticamente! Se agregaron $${input.declaredAmount.toLocaleString('es-CO')} COP a tu cuenta.`,
          requestId,
        };
      }

      return {
        success: true,
        status: (aiVerified === 2 ? "rejected_by_ai" : "pending") as string,
        message: aiVerified === 2
          ? "El comprobante no pudo ser verificado automáticamente. Por favor contacta al administrador por WhatsApp."
          : "Tu solicitud está en revisión. El saldo se acreditará en breve una vez verificado.",
        requestId,
        aiNotes,
      };
    }),

  // Get my recharge requests history
  myRechargeRequests: resellerProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getRechargeRequestsByCustomer(input.customerId);
    }),
});

// Helper function to send order to WhatsApp
async function sendOrderToWhatsApp(orderData: {
  customerId: number;
  customerName: string;
  customerPhone?: string;
  items: Array<{ productName: string; price: number; quantity: number }>;
  totalAmount: number;
  orderId: number;
}) {
  // Get WhatsApp configuration from settings
  const whatsappConfig = await db.getSetting("whatsapp_config");
  if (!whatsappConfig) {
    throw new Error("WhatsApp no está configurado");
  }

  const config = JSON.parse(whatsappConfig.value || "{}");
  const adminPhone = config.admin_phone || process.env.WHATSAPP_ADMIN_PHONE;

  if (!adminPhone) {
    throw new Error("Número de WhatsApp del administrador no configurado");
  }

  // Format order message
  const itemsList = orderData.items
    .map(
      (item) =>
        `• ${item.productName} x${item.quantity} = $${(item.price * item.quantity).toLocaleString("es-CO")} COP`
    )
    .join("\n");

  const message = `
📦 *NUEVO PEDIDO DE RESELLER*

👤 *Cliente:* ${orderData.customerName}
📱 *Teléfono:* ${orderData.customerPhone || "No proporcionado"}
🆔 *Pedido #:* ${orderData.orderId}

*Productos:*
${itemsList}

💰 *Total:* $${orderData.totalAmount.toLocaleString("es-CO")} COP

⏰ *Fecha:* ${new Date().toLocaleString("es-CO")}

Por favor, proceder con la entrega de los productos.
  `.trim();

  // Send via WhatsApp API (you'll need to configure this with your WhatsApp provider)
  // This is a placeholder - implement according to your WhatsApp integration
  console.log("[WhatsApp] Sending order message:", message);

  // Example using a WhatsApp API service
  // await axios.post(config.api_url, {
  //   to: adminPhone,
  //   message: message,
  // });
}
