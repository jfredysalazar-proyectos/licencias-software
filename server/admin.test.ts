import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminCookie = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createAdminContext(): { ctx: TrpcContext; cookies: AdminCookie[] } {
  const cookies: AdminCookie[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("admin.settings", () => {
  it("should list all settings", async () => {
    const { ctx } = createAdminContext();
    
    // Set admin session cookie
    ctx.req.cookies = {
      admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
    };

    const caller = appRouter.createCaller(ctx);

    const settings = await caller.admin.settings.list();

    expect(settings).toBeDefined();
    expect(Array.isArray(settings)).toBe(true);
    
    // Check that default settings exist
    const whatsappSetting = settings.find((s) => s.key === "whatsapp_number");
    expect(whatsappSetting).toBeDefined();
    expect(whatsappSetting?.value).toBeDefined();
  });
});

describe("admin.products", () => {
  it("should list all products", async () => {
    const { ctx } = createAdminContext();
    
    // Set admin session cookie
    ctx.req.cookies = {
      admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
    };

    const caller = appRouter.createCaller(ctx);

    const products = await caller.admin.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });
});

describe("admin.categories", () => {
  it("should list all categories", async () => {
    const { ctx } = createAdminContext();
    
    // Set admin session cookie
    ctx.req.cookies = {
      admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
    };

    const caller = appRouter.createCaller(ctx);

    const categories = await caller.admin.categories.list();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });
});

describe("admin.orders", () => {
  it("should list all orders", async () => {
    const { ctx } = createAdminContext();
    
    // Set admin session cookie
    ctx.req.cookies = {
      admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
    };

    const caller = appRouter.createCaller(ctx);

    const orders = await caller.admin.orders.list();

    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("admin.users", () => {
  it("should list all users", async () => {
    const { ctx } = createAdminContext();
    
    // Set admin session cookie
    ctx.req.cookies = {
      admin_session: Buffer.from(JSON.stringify({ adminId: 1, username: "admin" })).toString("base64"),
    };

    const caller = appRouter.createCaller(ctx);

    const users = await caller.admin.users.list();

    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });
});
