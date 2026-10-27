import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/server/auth/cookie";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { hasOrgRole, requireOrgRole, requireSystemAdmin, type AuthContext } from "@/server/auth/rbac";
import { generateSessionToken, hashToken } from "@/server/auth/tokens";
import { AppError } from "@/server/errors";

describe("password hashing", () => {
  it("verifies the correct password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$32768$8$1$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("correct horse battery stapl", hash)).toBe(false);
  });

  it("uses a unique salt per hash", async () => {
    expect(await hashPassword("same password!!")).not.toBe(await hashPassword("same password!!"));
  });

  it("rejects malformed or hostile stored hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$abc")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1073741824$8$1$c2FsdA$aGFzaA")).toBe(false);
  });
});

describe("session tokens", () => {
  it("generates 256-bit url-safe tokens and stable hashes", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateSessionToken()).not.toBe(token);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/dashboard/projects", "/dashboard/projects"],
    ["/dashboard/projects/new?domain=a.com", "/dashboard/projects/new?domain=a.com"],
    ["//evil.com", "/dashboard"],
    ["https://evil.com", "/dashboard"],
    ["/\\evil.com", "/dashboard"],
    [null, "/dashboard"],
    ["", "/dashboard"],
  ])("%s -> %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("rbac", () => {
  const ctx = (role: AuthContext["role"], systemRole: AuthContext["systemRole"] = "user"): AuthContext => ({
    userId: "u",
    name: "n",
    email: "e",
    systemRole,
    organizationId: "o",
    organizationName: "org",
    organizationStatus: "active",
    role,
    sessionId: "s",
  });

  it("orders organization roles", () => {
    expect(hasOrgRole("owner", "admin")).toBe(true);
    expect(hasOrgRole("member", "member")).toBe(true);
    expect(hasOrgRole("viewer", "member")).toBe(false);
  });

  it("throws FORBIDDEN for insufficient roles", () => {
    expect(() => requireOrgRole(ctx("viewer"), "member")).toThrow(AppError);
    expect(() => requireSystemAdmin(ctx("owner"))).toThrow(AppError);
    expect(() => requireSystemAdmin(ctx("viewer", "admin"))).not.toThrow();
  });
});
