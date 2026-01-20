import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customers table for end-user authentication (independent from OAuth users)
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  active: int("active").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Categories table for software products
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  iconUrl: text("iconUrl"), // URL to category icon/logo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table for software licenses
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 300 }),
  categoryId: int("categoryId").notNull(),
  basePrice: int("basePrice").notNull(), // Price in COP
  imageUrl: text("imageUrl"),
  featured: int("featured").default(0).notNull(), // 0 or 1 for boolean
  inStock: int("inStock").default(1).notNull(), // 0 or 1 for boolean
  features: text("features"), // JSON string of features array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product variants table - defines variant types for products
 * Example: "Tiempo de Licencia", "Versión", "Tipo de Cuenta"
 */
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Tiempo de Licencia"
  position: int("position").default(0).notNull(), // Order of display
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

/**
 * Variant options table - defines available options for each variant
 * Example: "1 mes", "3 meses", "6 meses" for "Tiempo de Licencia"
 */
export const variantOptions = mysqlTable("variant_options", {
  id: int("id").autoincrement().primaryKey(),
  variantId: int("variantId").notNull(),
  value: varchar("value", { length: 100 }).notNull(), // e.g., "1 mes"
  position: int("position").default(0).notNull(), // Order of display
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VariantOption = typeof variantOptions.$inferSelect;
export type InsertVariantOption = typeof variantOptions.$inferInsert;

/**
 * Product SKUs table - defines specific combinations of variants with pricing
 * Each SKU represents a unique combination of variant options
 */
export const productSkus = mysqlTable("product_skus", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(), // Unique identifier
  variantCombination: text("variantCombination").notNull(), // JSON: {"variantId": "optionId"}
  price: int("price").notNull(), // Price in COP for this specific combination
  inStock: int("inStock").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductSku = typeof productSkus.$inferSelect;
export type InsertProductSku = typeof productSkus.$inferInsert;

/**
 * Orders table for tracking purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId"), // Reference to customers table (null for guest orders)
  userId: int("userId"),
  customerName: varchar("customerName", { length: 200 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  items: text("items").notNull(), // JSON string of cart items
  totalAmount: int("totalAmount").notNull(), // Total in COP
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"), // License expiration date (default 30 days from completion)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Admin users table for backoffice access
 */
export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 200 }),
  active: int("active").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Settings table for site configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Sold licenses table for tracking license sales and expiration
 */
export const soldLicenses = mysqlTable("sold_licenses", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerWhatsapp: varchar("customerWhatsapp", { length: 50 }).notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(), // Denormalized for easy display
  licenseCode: varchar("licenseCode", { length: 500 }).notNull(),
  expirationDate: date("expirationDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SoldLicense = typeof soldLicenses.$inferSelect;
export type InsertSoldLicense = typeof soldLicenses.$inferInsert;
