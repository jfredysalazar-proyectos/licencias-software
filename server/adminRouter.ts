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
  // Check for token in Authorization header or cookie
  const authHeader = ctx.req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const adminSession = tokenFromHeader || ctx.req.cookies?.["admin_session"];
  
  if (!adminSession) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No admin session found",
    });
  }

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

      // Return session token to be stored in localStorage
      // This approach works better in development environments

      return {
        success: true,
        token: sessionData,
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

  me: publicProcedure.query(async ({ ctx }) => {
    // Check for token in Authorization header or cookie
    const authHeader = ctx.req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminSession = tokenFromHeader || ctx.req.cookies?.["admin_session"];
    
    if (!adminSession) {
      return null;
    }

    try {
      const adminData = JSON.parse(Buffer.from(adminSession, "base64").toString());
      const admin = await db.getAdminByUsername(adminData.username);
      
      if (!admin || admin.active === 0) {
        return null;
      }

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
      };
    } catch (error) {
      return null;
    }
  }),

  // ==================== PRODUCTS ====================
  products: router({
    list: adminProcedure.query(async () => {
      return await db.getAllProducts();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
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
          iconUrl: z.string().optional(),
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
          iconUrl: z.string().optional(),
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
        const fileName = `${uniqueId}.${fileExtension}`;
        const filePath = `uploads/products/${fileName}`;

        // Save to local filesystem (outside dist to persist across builds)
        const fs = await import("fs/promises");
        const path = await import("path");
        const uploadsDir = path.join(process.cwd(), "uploads", "products");
        
        // Ensure directory exists
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Write file
        const fullPath = path.join(uploadsDir, fileName);
        await fs.writeFile(fullPath, optimizedBuffer);

        // Return public URL
        const url = `/${filePath}`;

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

  // ==================== PRODUCT VARIANTS ====================
  variants: router({
    list: adminProcedure
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

    create: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          name: z.string().min(1),
          position: z.number().default(0),
          options: z.array(z.string()).min(1), // Array of option values
        })
      )
      .mutation(async ({ input }) => {
        // Create variant
        const variant = await db.createProductVariant({
          productId: input.productId,
          name: input.name,
          position: input.position,
        });

        // Create options
        await Promise.all(
          input.options.map((value, index) =>
            db.createVariantOption({
              variantId: variant.id,
              value,
              position: index,
            })
          )
        );

        return { success: true, variant };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          position: z.number().optional(),
          options: z.array(z.object({
            id: z.number().optional(),
            value: z.string(),
            position: z.number(),
          })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, options, ...variantData } = input;
        
        // Update variant
        if (Object.keys(variantData).length > 0) {
          await db.updateProductVariant(id, variantData);
        }

        // Update options if provided
        if (options) {
          // Get existing options
          const existingOptions = await db.getVariantOptions(id);
          const existingIds = existingOptions.map(o => o.id);
          const inputIds = options.filter(o => o.id).map(o => o.id!);

          // Delete removed options
          const toDelete = existingIds.filter(id => !inputIds.includes(id));
          await Promise.all(toDelete.map(id => db.deleteVariantOption(id)));

          // Update or create options
          await Promise.all(
            options.map(async (option) => {
              if (option.id) {
                await db.updateVariantOption(option.id, {
                  value: option.value,
                  position: option.position,
                });
              } else {
                await db.createVariantOption({
                  variantId: id,
                  value: option.value,
                  position: option.position,
                });
              }
            })
          );
        }

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductVariant(input.id);
        return { success: true };
      }),
  }),

  // ==================== PRODUCT SKUS ====================
  skus: router({
    list: adminProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductSkus(input.productId);
      }),

    create: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          sku: z.string().min(1),
          variantCombination: z.string(), // JSON string
          price: z.number().min(0),
          inStock: z.number().default(1),
        })
      )
      .mutation(async ({ input }) => {
        const sku = await db.createProductSku(input);
        return { success: true, sku };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          sku: z.string().min(1).optional(),
          variantCombination: z.string().optional(),
          price: z.number().min(0).optional(),
          inStock: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductSku(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductSku(input.id);
        return { success: true };
      }),
  }),

  // Sold Licenses Management
  soldLicenses: router({
    list: adminProcedure.query(async () => {
      return db.getAllSoldLicenses();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSoldLicenseById(input.id);
      }),

    getExpiringSoon: adminProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => {
        return db.getExpiringSoonLicenses(input.days);
      }),

    create: adminProcedure
      .input(
        z.object({
          customerName: z.string(),
          customerEmail: z.string().email(),
          customerWhatsapp: z.string(),
          productId: z.number(),
          productName: z.string(),
          licenseCode: z.string(),
          expirationDate: z.string(), // YYYY-MM-DD format
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const licenseData = {
          ...input,
          expirationDate: new Date(input.expirationDate),
        };
        return db.createSoldLicense(licenseData);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          customerName: z.string().optional(),
          customerEmail: z.string().email().optional(),
          customerWhatsapp: z.string().optional(),
          productId: z.number().optional(),
          productName: z.string().optional(),
          licenseCode: z.string().optional(),
          expirationDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData = {
          ...data,
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        };
        await db.updateSoldLicense(id, updateData);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSoldLicense(input.id);
        return { success: true };
      }),
  }),
});
