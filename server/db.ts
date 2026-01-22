import { eq, like, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, Category, InsertCategory, products, Product, InsertProduct, orders, Order, InsertOrder, admins, Admin, InsertAdmin, settings, Setting, InsertSetting, customers, Customer, InsertCustomer, productVariants, ProductVariant, InsertProductVariant, variantOptions, VariantOption, InsertVariantOption, productSkus, ProductSku, InsertProductSku, soldLicenses, SoldLicense, InsertSoldLicense } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Categories queries
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

// Products queries
export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(desc(products.featured), desc(products.createdAt));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.featured, 1)).limit(6);
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(like(products.name, `%${query}%`));
}

// Orders queries
export async function createOrder(order: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result[0].insertId;
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}


// ==================== ADMIN FUNCTIONS ====================

export async function getAdminByUsername(username: string): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  return result[0];
}

export async function updateAdminLastLogin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(admins).set({ lastLogin: new Date() }).where(eq(admins.id, id));
}

export async function getAllAdmins(): Promise<Admin[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(admins);
}

// ==================== SETTINGS FUNCTIONS ====================

export async function getSetting(key: string): Promise<Setting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result[0];
}

export async function getAllSettings(): Promise<Setting[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(settings);
}

export async function upsertSetting(key: string, value: string, description?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(settings).values({
    key,
    value,
    description,
  }).onDuplicateKeyUpdate({
    set: { value, description, updatedAt: new Date() },
  });
}

// ==================== ADMIN PRODUCT MANAGEMENT ====================

export async function createProduct(product: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Solo insertar campos explícitos, excluyendo los que tienen valores por defecto
  const insertData: any = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    imageUrl: product.imageUrl
  };
  
  // Agregar campos opcionales solo si están definidos
  if (product.featured !== undefined) insertData.featured = product.featured;
  if (product.inStock !== undefined) insertData.inStock = product.inStock;
  if (product.features !== undefined) insertData.features = product.features;
  if (product.platforms !== undefined) insertData.platforms = product.platforms;
  
  // CRUCIAL: Eliminar todas las claves con valor undefined del objeto
  // Esto evita que Drizzle genere queries con DEFAULT keyword
  Object.keys(insertData).forEach(key => {
    if (insertData[key] === undefined) {
      delete insertData[key];
    }
  });
  
  const result = await db.insert(products).values(insertData);
  return result[0].insertId;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ==================== ADMIN CATEGORY MANAGEMENT ====================

export async function createCategory(category: InsertCategory): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result[0].insertId;
}

export async function updateCategory(id: number, category: Partial<InsertCategory>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(category).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ==================== ADMIN ORDER MANAGEMENT ====================

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "pending" | "completed" | "cancelled"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

// ==================== ADMIN USER MANAGEMENT ====================

export async function getAllUsers(): Promise<typeof users.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== CUSTOMER AUTHENTICATION ====================

export async function createCustomer(customer: InsertCustomer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result[0].insertId;
}

export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  return result[0];
}

export async function getCustomerById(id: number): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function updateCustomerLastLogin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ lastLogin: new Date() }).where(eq(customers.id, id));
}

export async function getCustomerOrders(customerId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
  return result;
}

// ==================== PRODUCT VARIANTS ====================

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productVariants).where(eq(productVariants.productId, productId)).orderBy(productVariants.position);
}

export async function createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Solo insertar campos explícitos, sin id ni createdAt (se manejan automáticamente)
  // Fix: Evitar el error "Failed query: insert into product_variants with default values"
  const insertData = {
    productId: variant.productId,
    name: variant.name,
    position: variant.position ?? 0,
  };
  
  const result = await db.insert(productVariants).values(insertData);
  return { 
    ...insertData, 
    id: Number(result[0].insertId),
    createdAt: new Date(),
  } as ProductVariant;
}

export async function updateProductVariant(id: number, data: Partial<InsertProductVariant>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productVariants).set(data).where(eq(productVariants.id, id));
}

export async function deleteProductVariant(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated options first
  await db.delete(variantOptions).where(eq(variantOptions.variantId, id));
  // Delete the variant
  await db.delete(productVariants).where(eq(productVariants.id, id));
}

// ==================== VARIANT OPTIONS ====================

export async function getVariantOptions(variantId: number): Promise<VariantOption[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(variantOptions).where(eq(variantOptions.variantId, variantId)).orderBy(variantOptions.position);
}

export async function createVariantOption(option: InsertVariantOption): Promise<VariantOption> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Solo insertar campos explícitos, sin id ni createdAt (se manejan automáticamente)
  const insertData = {
    variantId: option.variantId,
    value: option.value,
    position: option.position ?? 0,
  };
  
  const result = await db.insert(variantOptions).values(insertData);
  return { 
    ...insertData, 
    id: Number(result[0].insertId),
    createdAt: new Date(),
  } as VariantOption;
}

export async function updateVariantOption(id: number, data: Partial<InsertVariantOption>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(variantOptions).set(data).where(eq(variantOptions.id, id));
}

export async function deleteVariantOption(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(variantOptions).where(eq(variantOptions.id, id));
}

// ==================== PRODUCT SKUS ====================

export async function getProductSkus(productId: number): Promise<ProductSku[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productSkus).where(eq(productSkus.productId, productId));
}

export async function getProductSkuById(id: number): Promise<ProductSku | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productSkus).where(eq(productSkus.id, id));
  return result[0];
}

export async function getProductSkuBySku(sku: string): Promise<ProductSku | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productSkus).where(eq(productSkus.sku, sku));
  return result[0];
}

export async function createProductSku(sku: InsertProductSku): Promise<ProductSku> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Solo insertar campos explícitos, sin id, createdAt ni updatedAt (se manejan automáticamente)
  const insertData = {
    productId: sku.productId,
    sku: sku.sku,
    variantCombination: sku.variantCombination,
    price: sku.price,
    inStock: sku.inStock ?? 1,
  };
  
  const result = await db.insert(productSkus).values(insertData);
  return { 
    ...insertData, 
    id: Number(result[0].insertId),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ProductSku;
}

export async function updateProductSku(id: number, data: Partial<InsertProductSku>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productSkus).set(data).where(eq(productSkus.id, id));
}

export async function deleteProductSku(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productSkus).where(eq(productSkus.id, id));
}

export async function deleteProductSkusByProductId(productId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productSkus).where(eq(productSkus.productId, productId));
}

// ============================================================================
// Sold Licenses Functions
// ============================================================================

export async function createSoldLicense(license: InsertSoldLicense): Promise<SoldLicense> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(soldLicenses).values(license);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(soldLicenses).where(eq(soldLicenses.id, insertedId));
  if (!created || created.length === 0) {
    throw new Error("Failed to retrieve created sold license");
  }
  return created[0];
}

export async function getAllSoldLicenses(): Promise<SoldLicense[]> {
  const db = await getDb();
  if (!db) return [];

  // Order by expiration date ascending (soonest to expire first)
  return db.select().from(soldLicenses).orderBy(soldLicenses.expirationDate);
}

export async function getSoldLicenseById(id: number): Promise<SoldLicense | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(soldLicenses).where(eq(soldLicenses.id, id));
  return result[0] || null;
}

export async function updateSoldLicense(id: number, updates: Partial<InsertSoldLicense>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(soldLicenses).set(updates).where(eq(soldLicenses.id, id));
}

export async function deleteSoldLicense(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(soldLicenses).where(eq(soldLicenses.id, id));
}

export async function getExpiringSoonLicenses(daysThreshold: number = 30): Promise<SoldLicense[]> {
  const db = await getDb();
  if (!db) return [];

  // Get licenses expiring within the next X days
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysThreshold);

  const allLicenses = await getAllSoldLicenses();
  
  return allLicenses.filter(license => {
    const expirationDate = new Date(license.expirationDate);
    return expirationDate >= today && expirationDate <= futureDate;
  });
}
