import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Helper to generate JWT token
async function generateToken(customerId: number, email: string) {
  const token = await new SignJWT({ customerId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
  return token;
}

// Helper to verify JWT token
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { customerId: number; email: string };
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token inválido" });
  }
}

// Middleware for customer authentication
const customerProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No autenticado" });
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  
  const customer = await db.getCustomerById(payload.customerId);
  if (!customer || !customer.active) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Cliente no encontrado o inactivo" });
  }

  return next({
    ctx: {
      ...ctx,
      customer,
    },
  });
});

export const customerRouter = router({
  // Register new customer
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        name: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingCustomer = await db.getCustomerByEmail(input.email);
      if (existingCustomer) {
        throw new TRPCError({ 
          code: "CONFLICT", 
          message: "El email ya está registrado" 
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create customer
      const customerId = await db.createCustomer({
        email: input.email,
        passwordHash,
        name: input.name,
        phone: input.phone,
        active: 1,
      });

      // Generate token
      const token = await generateToken(customerId, input.email);

      return {
        success: true,
        token,
        customer: {
          id: customerId,
          email: input.email,
          name: input.name,
          phone: input.phone ?? null,
          role: "customer" as const,
          balance: 0,
        },
      };
    }),

  // Login customer
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Find customer by email
      const customer = await db.getCustomerByEmail(input.email);
      if (!customer) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Email o contraseña incorrectos" 
        });
      }

      // Check if customer is active
      if (!customer.active) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Cuenta desactivada" 
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, customer.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Email o contraseña incorrectos" 
        });
      }

      // Update last login
      await db.updateCustomerLastLogin(customer.id);

      // Generate token
      const token = await generateToken(customer.id, customer.email);

      return {
        success: true,
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone ?? null,
          role: customer.role,
          balance: customer.balance,
        },
      };
    }),

  // Get current customer info
  me: customerProcedure.query(({ ctx }) => {
    return {
      id: ctx.customer.id,
      email: ctx.customer.email,
      name: ctx.customer.name,
      phone: ctx.customer.phone,
      role: ctx.customer.role,
      balance: ctx.customer.balance,
      createdAt: ctx.customer.createdAt,
    };
  }),

  // Logout (client-side will remove token)
  logout: publicProcedure.mutation(() => {
    return { success: true };
  }),

  // Get customer orders with license expiry
  myOrders: customerProcedure.query(async ({ ctx }) => {
    return await db.getCustomerOrders(ctx.customer.id);
  }),

  // ==================== RECHARGE REQUESTS ====================

  // Submit voucher for AI verification and balance top-up
  submitRecharge: customerProcedure
    .input(z.object({
      declaredAmount: z.number().min(1000).max(10000000),
      paymentMethod: z.enum(["nequi", "daviplata", "otro"]),
      voucherBase64: z.string(),
      voucherFileName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const customer = ctx.customer;

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
        // Fallback: store as data URL if storage fails
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

        const response = await invokeLLM({
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
  myRechargeRequests: customerProcedure.query(async ({ ctx }) => {
    return await db.getRechargeRequestsByCustomer(ctx.customer.id);
  }),
});
