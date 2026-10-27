import { afterAll, describe, expect, it } from "vitest";
import { listUsers, setUserStatus } from "@/server/admin/service";
import { login, logout, register, resolveSession } from "@/server/auth/service";
import { Membership, User } from "@/server/db/models";
import { AppError } from "@/server/errors";
import { archiveProject, createProject, getProject, listProjects } from "@/server/projects/service";
import { startTestDb } from "../support/test-db";

const db = await startTestDb("auth");
afterAll(async () => db?.stop());

let ipCounter = 0;
const client = () => ({ ip: `203.0.113.${++ipCounter}`, userAgent: "vitest" });
const password = "a sufficiently long password";

async function signUp(email: string, name = "Test User") {
  const session = await register({ name, email, password }, client());
  const ctx = await resolveSession(session.token);
  if (!ctx) throw new Error("session did not resolve");
  return { session, ctx };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toSatisfy((error) => error instanceof AppError && error.code === code);
}

describe.skipIf(!db)("authentication", () => {
  it("registers a user with an owned organization and a working session", async () => {
    const { ctx } = await signUp("Owner@Example.com", "Olivia Owner");
    expect(ctx.email).toBe("owner@example.com");
    expect(ctx.role).toBe("owner");
    expect(ctx.systemRole).toBe("user");
    expect(ctx.organizationName).toBe("Olivia Owner's workspace");
    const stored = await User.findOne({ email: "owner@example.com" }).select("+passwordHash").lean();
    expect(stored?.passwordHash).toMatch(/^scrypt\$/);
  });

  it("rejects duplicate emails", async () => {
    await signUp("dupe@example.com");
    await expectCode(register({ name: "X", email: "DUPE@example.com", password }, client()), "CONFLICT");
  });

  it("logs in with the right password only, and logout invalidates the session", async () => {
    await signUp("login@example.com");
    await expectCode(login({ email: "login@example.com", password: "wrong password!!" }, client()), "UNAUTHENTICATED");
    await expectCode(login({ email: "nobody@example.com", password }, client()), "UNAUTHENTICATED");

    const session = await login({ email: "login@example.com", password }, client());
    expect(await resolveSession(session.token)).not.toBeNull();
    await logout(session.token);
    expect(await resolveSession(session.token)).toBeNull();
  });

  it("does not resolve unknown or expired tokens", async () => {
    const { session } = await signUp("expiry@example.com");
    expect(await resolveSession("not-a-real-token")).toBeNull();
    expect(await resolveSession(session.token, new Date(Date.now() + 31 * 24 * 3600 * 1000))).toBeNull();
  });

  it("rate-limits repeated login attempts for one email", async () => {
    await signUp("brute@example.com");
    const attempts = Array.from({ length: 8 }, () =>
      login({ email: "brute@example.com", password: "wrong password!!" }, client()).catch((e) => e.code),
    );
    expect(await Promise.all(attempts)).toEqual(Array(8).fill("UNAUTHENTICATED"));
    await expectCode(login({ email: "brute@example.com", password }, client()), "RATE_LIMITED");
  });

  it("invalidates sessions when the membership is revoked", async () => {
    const { session, ctx } = await signUp("revoked@example.com");
    await Membership.deleteMany({ userId: ctx.userId });
    expect(await resolveSession(session.token)).toBeNull();
  });
});

describe.skipIf(!db)("organization isolation", () => {
  it("never exposes one organization's projects to another", async () => {
    const a = await signUp("alice@example.com");
    const b = await signUp("bob@example.com");

    const project = await createProject(a.ctx, { domain: "https://www.backlinksfusion.com", country: "DE", languages: ["de", "en"] });
    expect(project.domain).toBe("backlinksfusion.com");
    expect((await listProjects(a.ctx)).map((p) => p.id)).toEqual([project.id]);

    expect(await listProjects(b.ctx)).toEqual([]);
    await expectCode(getProject(b.ctx, project.id), "NOT_FOUND");
    await expectCode(archiveProject(b.ctx, project.id), "NOT_FOUND");

    // Same domain and market in another organization is allowed.
    await expect(createProject(b.ctx, { domain: "backlinksfusion.com", country: "DE", languages: ["de"] })).resolves.toBeTruthy();
    // But not twice in the same organization.
    await expectCode(createProject(a.ctx, { domain: "backlinksfusion.com", country: "DE", languages: ["en"] }), "CONFLICT");
  });

  it("enforces organization roles", async () => {
    const { ctx } = await signUp("viewer@example.com");
    const viewer = { ...ctx, role: "viewer" as const };
    await expectCode(createProject(viewer, { domain: "viewer.com", country: "DE", languages: ["de"] }), "FORBIDDEN");

    const project = await createProject(ctx, { domain: "member.com", country: "US", languages: ["en"] });
    await expectCode(archiveProject({ ...ctx, role: "member" }, project.id), "FORBIDDEN");
    await archiveProject(ctx, project.id);
    expect(await listProjects(ctx)).toEqual([]);
  });

  it("blocks writes in a suspended organization", async () => {
    const { ctx } = await signUp("suspended-org@example.com");
    await expectCode(
      createProject({ ...ctx, organizationStatus: "suspended" }, { domain: "x.com", country: "DE", languages: ["de"] }),
      "ACCOUNT_SUSPENDED",
    );
  });
});

describe.skipIf(!db)("admin", () => {
  it("is restricted to system administrators", async () => {
    const { ctx } = await signUp("not-admin@example.com");
    await expectCode(listUsers(ctx), "FORBIDDEN");
  });

  it("suspends a user, revoking sessions and blocking login", async () => {
    const admin = await signUp("admin@example.com");
    await User.updateOne({ email: "admin@example.com" }, { systemRole: "admin" });
    const adminCtx = (await resolveSession(admin.session.token))!;
    expect(adminCtx.systemRole).toBe("admin");

    const target = await signUp("target@example.com");
    await setUserStatus(adminCtx, target.ctx.userId, "suspended");
    expect(await resolveSession(target.session.token)).toBeNull();
    await expectCode(login({ email: "target@example.com", password }, client()), "ACCOUNT_SUSPENDED");
    await expectCode(setUserStatus(adminCtx, adminCtx.userId, "suspended"), "VALIDATION_FAILED");

    await setUserStatus(adminCtx, target.ctx.userId, "active");
    await expect(login({ email: "target@example.com", password }, client())).resolves.toBeTruthy();
    expect((await listUsers(adminCtx)).some((u) => u.email === "target@example.com")).toBe(true);
  });
});
