import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {
        admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
      },
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("admin.categories", () => {
  it("should list all categories", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.admin.categories.list();

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    // Verify category structure
    const category = categories[0];
    expect(category).toHaveProperty("id");
    expect(category).toHaveProperty("name");
    expect(category).toHaveProperty("slug");
    expect(category).toHaveProperty("iconUrl");
  });

  it("should create a new category", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const newCategory = {
      name: "Test Category",
      slug: "test-category",
      description: "A test category",
      iconUrl: "/icons/test.webp",
    };

    const result = await caller.admin.categories.create(newCategory);

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("number");
  });

  it("should update a category", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get first category
    const categories = await caller.admin.categories.list();
    const categoryId = categories[0]?.id;

    if (!categoryId) {
      throw new Error("No categories found for update test");
    }

    const updateData = {
      id: categoryId,
      name: "Updated Category Name",
      iconUrl: "/icons/updated.webp",
    };

    const result = await caller.admin.categories.update(updateData);

    expect(result.success).toBe(true);
  });

  it("should validate required fields on create", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.categories.create({
        name: "",
        slug: "",
      })
    ).rejects.toThrow();
  });

  it("should handle category with icon", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.admin.categories.list();
    const categoryWithIcon = categories.find((c) => c.iconUrl);

    if (categoryWithIcon) {
      expect(categoryWithIcon.iconUrl).toBeTruthy();
      expect(typeof categoryWithIcon.iconUrl).toBe("string");
    }
  });
});
