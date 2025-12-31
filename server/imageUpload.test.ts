import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
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

  return ctx;
}

describe("admin.uploadImage", () => {
  it("should validate image data format", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Test with invalid base64 data
    await expect(
      caller.admin.uploadImage({
        imageData: "invalid-base64-data",
        fileName: "test.png",
      })
    ).rejects.toThrow();
  });

  it("should accept valid base64 image data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a minimal valid PNG base64 string (1x1 transparent pixel)
    const validPngBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.admin.uploadImage({
      imageData: validPngBase64,
      fileName: "test.png",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
  });

  it("should require admin authentication", async () => {
    // Create context without admin session
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
        cookies: {},
      } as TrpcContext["req"],
      res: {
        cookie: () => {},
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const validPngBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    await expect(
      caller.admin.uploadImage({
        imageData: validPngBase64,
        fileName: "test.png",
      })
    ).rejects.toThrow("No admin session found");
  });
});
