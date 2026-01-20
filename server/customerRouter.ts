import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { TRPCError } from "@trpc/server";

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
});
