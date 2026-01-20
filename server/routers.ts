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
      return await db.getAllProducts();
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
        return await db.getProductBySlug(input.slug);
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.query);
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
