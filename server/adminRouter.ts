import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import sharp from "sharp";
import { nanoid } from "nanoid";

// Admin context type
interface AdminContext {
  adminId: number;
  username: string;
}

// Middleware to check if user is admin
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const adminSession = ctx.req.cookies?.["admin_session"];
  
  if (!adminSession) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No admin session found",
    });
  }

  // In production, you'd verify a JWT or session token here
  // For now, we'll use a simple cookie-based approach
  try {
    const adminData = JSON.parse(Buffer.from(adminSession, "base64").toString());
    const admin = await db.getAdminByUsername(adminData.username);
    
    if (!admin || admin.active === 0) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid admin session",
      });
    }

    return next({
      ctx: {
        ...ctx,
        admin: {
          adminId: admin.id,
          username: admin.username,
        } as AdminContext,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid admin session",
    });
  }
});

export const adminRouter = router({
  // ==================== AUTHENTICATION ====================
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const admin = await db.getAdminByUsername(input.username);

      if (!admin || admin.active === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const isValidPassword = await bcrypt.compare(input.password, admin.passwordHash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Update last login
      await db.updateAdminLastLogin(admin.id);

      // Create session cookie
      const sessionData = Buffer.from(
        JSON.stringify({ adminId: admin.id, username: admin.username })
      ).toString("base64");

      ctx.res.cookie("admin_session", sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
        },
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("admin_session", { path: "/" });
    return { success: true };
  }),

  me: adminProcedure.query(async ({ ctx }) => {
    const admin = await db.getAdminByUsername(ctx.admin.username);
    if (!admin) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Admin not found",
      });
    }
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
    };
  }),

  // ==================== PRODUCTS ====================
  products: router({
    list: adminProcedure.query(async () => {
      return await db.getAllProducts();
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().min(1),
          shortDescription: z.string().optional(),
          categoryId: z.number(),
          basePrice: z.number().min(0),
          imageUrl: z.string().optional(),
          featured: z.number().min(0).max(1).default(0),
          inStock: z.number().min(0).max(1).default(1),
          features: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createProduct(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          shortDescription: z.string().optional(),
          categoryId: z.number().optional(),
          basePrice: z.number().min(0).optional(),
          imageUrl: z.string().optional(),
          featured: z.number().min(0).max(1).optional(),
          inStock: z.number().min(0).max(1).optional(),
          features: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ==================== CATEGORIES ====================
  categories: router({
    list: adminProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createCategory(input);
        return { id, success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ==================== ORDERS ====================
  orders: router({
    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ==================== USERS ====================
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
  }),

  // ==================== IMAGE UPLOAD ====================
  uploadImage: adminProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Decode base64 image
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Optimize image with sharp (convert to WebP, resize if too large)
        const optimizedBuffer = await sharp(buffer)
          .resize(800, 800, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();

        // Generate unique filename
        const fileExtension = "webp";
        const uniqueId = nanoid(10);
        const fileName = `products/${uniqueId}.${fileExtension}`;

        // Upload to S3
        const { url } = await storagePut(fileName, optimizedBuffer, "image/webp");

        return {
          success: true,
          url,
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  // ==================== SETTINGS ====================
  settings: router({
    list: adminProcedure.query(async () => {
      return await db.getAllSettings();
    }),

    update: adminProcedure
      .input(
        z.object({
          key: z.string().min(1),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertSetting(input.key, input.value, input.description);
        return { success: true };
      }),
  }),
});
