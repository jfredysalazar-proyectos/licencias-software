import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { adminRouter } from "./adminRouter";
import { customerRouter } from "./customerRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  admin: adminRouter,
  customer: customerRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      const products = await db.getAllProducts();
      // Normalizar platforms en todos los productos
      return products.map(product => {
        if (product.platforms) {
          if (Array.isArray(product.platforms)) {
            product.platforms = JSON.stringify(product.platforms) as any;
          } else if (typeof product.platforms === 'string') {
            try {
              JSON.parse(product.platforms);
            } catch (e) {
              product.platforms = JSON.stringify([product.platforms]) as any;
            }
          }
        }
        return product;
      });
    }),
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProducts();
    }),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (product && product.platforms) {
          // Normalizar platforms: si es array, convertir a JSON string
          if (Array.isArray(product.platforms)) {
            product.platforms = JSON.stringify(product.platforms) as any;
          } else if (typeof product.platforms === 'string') {
            // Verificar si ya es JSON válido
            try {
              JSON.parse(product.platforms);
            } catch (e) {
              // Si no es JSON válido, convertir a array JSON
              product.platforms = JSON.stringify([product.platforms]) as any;
            }
          }
        }
        return product;
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.query);
      }),
    variants: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const variants = await db.getProductVariants(input.productId);
        // Get options for each variant
        const variantsWithOptions = await Promise.all(
          variants.map(async (variant) => {
            const options = await db.getVariantOptions(variant.id);
            return { ...variant, options };
          })
        );
        return variantsWithOptions;
      }),
    skus: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductSkus(input.productId);
      }),
    related: publicProcedure
      .input(z.object({ 
        categoryId: z.number(),
        currentProductId: z.number(),
        limit: z.number().optional().default(8)
      }))
      .query(async ({ input }) => {
        const products = await db.getProductsByCategory(input.categoryId);
        // Filter out current product and limit results
        return products
          .filter(p => p.id !== input.currentProductId)
          .slice(0, input.limit);
      }),
  }),

  paymentMethods: router({
    getEnabled: publicProcedure.query(async () => {
      return await db.getEnabledPaymentMethods();
    }),
    createHoodpayOrder: publicProcedure
      .input(
        z.object({
          customerEmail: z.string().email(),
          customerName: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              quantity: z.number(),
              price: z.number(),
            })
          ),
          totalAmount: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        // Get Hoodpay configuration
        const hoodpayMethod = await db.getPaymentMethodByName('hoodpay');
        if (!hoodpayMethod || !hoodpayMethod.enabled) {
          throw new Error('Hoodpay no está habilitado');
        }

        const config = hoodpayMethod.config ? JSON.parse(hoodpayMethod.config) : {};
        if (!config.api_key) {
          throw new Error('Hoodpay no está configurado correctamente');
        }

        // Create order in Hoodpay
        const { createHoodpayOrder } = await import('./hoodpay');
        const hoodpayOrder = await createHoodpayOrder({
          apiKey: config.api_key,
          amount: input.totalAmount,
          currency: 'USD', // Hoodpay works with USD
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          items: input.items,
        });

        // Create order in our database
        const order = await db.createOrder({
          customerId: undefined,
          customerName: input.customerName || input.customerEmail,
          customerEmail: input.customerEmail,
          customerPhone: '',
          items: JSON.stringify(input.items),
          totalAmount: input.totalAmount,
        });

        return {
          orderId: order.id,
          hoodpayOrderId: hoodpayOrder.id,
          paymentUrl: hoodpayOrder.payment_url,
        };
      }),
  }),

  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerId: z.number().optional(),
          customerName: z.string().optional(),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().optional(),
          items: z.string(),
          totalAmount: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calculate expiry date (30 days from now for completed orders)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        const orderId = await db.createOrder({
          customerId: input.customerId,
          userId: ctx.user?.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          items: input.items,
          totalAmount: input.totalAmount,
          status: "pending",
          expiresAt: expiresAt,
        });
        return { orderId };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
