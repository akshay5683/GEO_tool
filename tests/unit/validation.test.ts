import { describe, expect, it } from "vitest";
import { createProjectSchema, loginSchema, registerSchema } from "@/lib/validation";

describe("registerSchema", () => {
  it("normalizes email and applies defaults", () => {
    const data = registerSchema.parse({ name: " Ada ", email: " Ada@Example.COM ", password: "x".repeat(12) });
    expect(data).toEqual({ name: "Ada", email: "ada@example.com", password: "x".repeat(12), organizationName: "" });
  });

  it("rejects short passwords and invalid emails", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "A", email: "not-an-email", password: "x".repeat(12) }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("createProjectSchema", () => {
  it("normalizes the domain and deduplicates languages", () => {
    const data = createProjectSchema.parse({
      domain: "https://www.BacklinksFusion.com/",
      country: "DE",
      languages: ["de", "en", "de"],
    });
    expect(data).toEqual({ name: "", domain: "backlinksfusion.com", country: "DE", languages: ["de", "en"] });
  });

  it("rejects unsafe domains with a readable message", () => {
    const result = createProjectSchema.safeParse({ domain: "localhost", country: "DE", languages: ["de"] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["domain"]);
  });

  it("rejects unsupported markets and empty languages", () => {
    expect(createProjectSchema.safeParse({ domain: "a.com", country: "XX", languages: ["de"] }).success).toBe(false);
    expect(createProjectSchema.safeParse({ domain: "a.com", country: "DE", languages: [] }).success).toBe(false);
  });
});
