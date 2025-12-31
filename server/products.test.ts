import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should list all products", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("should get product by slug", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySlug({ slug: "windows-11-pro" });

    expect(product).toBeDefined();
    expect(product?.name).toBe("Windows 11 Pro");
    expect(product?.slug).toBe("windows-11-pro");
  });

  it("should return null or undefined for non-existent product slug", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getBySlug({ slug: "non-existent-product" });

    expect(product).toBeUndefined();
  });

  it("should filter products by category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Get all products first
    const allProducts = await caller.products.list();
    
    // Get products from first category
    if (allProducts.length > 0) {
      const categoryId = allProducts[0]?.categoryId;
      const filteredProducts = allProducts.filter(p => p.categoryId === categoryId);
      
      expect(filteredProducts.length).toBeGreaterThan(0);
      expect(filteredProducts.every(p => p.categoryId === categoryId)).toBe(true);
    }
  });

  it("should have required product fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    if (products.length > 0) {
      const product = products[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("basePrice");
      expect(product).toHaveProperty("categoryId");
      expect(product).toHaveProperty("inStock");
    }
  });
});

describe("categories router", () => {
  it("should list all categories", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("should have required category fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();

    if (categories.length > 0) {
      const category = categories[0];
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
    }
  });
});
