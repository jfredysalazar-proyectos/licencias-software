import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import axios from "axios";

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
  // Get reseller products (with reseller prices)
  products: publicProcedure.query(async () => {
    const products = await db.getAllProducts();
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
