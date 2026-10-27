import "server-only";
import { Types } from "mongoose";
import { loginSchema, registerSchema } from "@/lib/validation";
import { connectDb } from "../db/connect";
import { Membership, Organization, Session, User, type OrgRole } from "../db/models";
import { AppError } from "../errors";
import { RATE_LIMITS, consumeRateLimit } from "../rate-limit";
import { getDummyHash, hashPassword, verifyPassword } from "./password";
import type { AuthContext } from "./rbac";
import { generateSessionToken, hashToken } from "./tokens";

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const LAST_SEEN_RESOLUTION_MS = 10 * 60 * 1000;

export type ClientInfo = { ip: string; userAgent: string };
export type IssuedSession = { token: string; expiresAt: Date };

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

async function createSession(
  userId: Types.ObjectId,
  organizationId: Types.ObjectId,
  client: ClientInfo,
): Promise<IssuedSession> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  await Session.create({
    tokenHash: hashToken(token),
    userId,
    activeOrganizationId: organizationId,
    expiresAt,
    lastSeenAt: now,
    userAgent: client.userAgent.slice(0, 400),
  });
  return { token, expiresAt };
}

/**
 * Creates a user, their first organization and an owner membership, then
 * signs them in. MongoDB transactions are not required: on a partial failure
 * the records created by this call are removed.
 */
export async function register(input: unknown, client: ClientInfo): Promise<IssuedSession> {
  const data = registerSchema.parse(input);
  await connectDb();
  await consumeRateLimit(`register:ip:${client.ip}`, RATE_LIMITS.registerPerIp);

  const passwordHash = await hashPassword(data.password);
  let user;
  try {
    user = await User.create({ email: data.email, name: data.name, passwordHash });
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new AppError("CONFLICT", "An account with this email already exists. Sign in instead.");
    }
    throw error;
  }

  let organizationId: Types.ObjectId | null = null;
  try {
    const organization = await Organization.create({
      name: data.organizationName || `${data.name}'s workspace`,
      createdBy: user._id,
    });
    organizationId = organization._id;
    await Membership.create({ organizationId, userId: user._id, role: "owner" satisfies OrgRole });
    return await createSession(user._id, organizationId, client);
  } catch (error) {
    await Promise.allSettled([
      User.deleteOne({ _id: user._id }),
      organizationId ? Organization.deleteOne({ _id: organizationId }) : null,
      organizationId ? Membership.deleteMany({ organizationId }) : null,
    ]);
    throw error;
  }
}

export async function login(input: unknown, client: ClientInfo): Promise<IssuedSession> {
  const data = loginSchema.parse(input);
  await connectDb();
  await consumeRateLimit(`login:ip:${client.ip}`, RATE_LIMITS.loginPerIp);
  await consumeRateLimit(`login:email:${data.email}`, RATE_LIMITS.loginPerEmail);

  const user = await User.findOne({ email: data.email }).select("+passwordHash");
  const valid = await verifyPassword(data.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    throw new AppError("UNAUTHENTICATED", "Email or password is incorrect.");
  }
  if (user.status !== "active") {
    throw new AppError("ACCOUNT_SUSPENDED", "This account is suspended. Contact support.");
  }

  const membership = await Membership.findOne({ userId: user._id }).sort({ createdAt: 1 }).lean();
  if (!membership) {
    throw new AppError("FORBIDDEN", "This account does not belong to any organization.");
  }
  user.lastLoginAt = new Date();
  await user.save();
  return createSession(user._id, membership.organizationId, client);
}

export async function logout(token: string): Promise<void> {
  await connectDb();
  await Session.deleteOne({ tokenHash: hashToken(token) });
}

/** Resolves a session token into a fresh AuthContext, or null if it is no longer valid. */
export async function resolveSession(token: string, now = new Date()): Promise<AuthContext | null> {
  if (!token || token.length > 200) return null;
  await connectDb();
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: now } });
  if (!session) return null;

  const user = await User.findById(session.userId).lean();
  if (!user || user.status !== "active") {
    await Session.deleteOne({ _id: session._id });
    return null;
  }

  // Memberships can be revoked while a session is live, so always re-check.
  let membership = await Membership.findOne({
    userId: user._id,
    organizationId: session.activeOrganizationId,
  }).lean();
  if (!membership) {
    membership = await Membership.findOne({ userId: user._id }).sort({ createdAt: 1 }).lean();
    if (!membership) {
      await Session.deleteOne({ _id: session._id });
      return null;
    }
    session.activeOrganizationId = membership.organizationId;
  }

  const organization = await Organization.findById(membership.organizationId).lean();
  if (!organization) return null;

  if (session.isModified() || now.getTime() - session.lastSeenAt.getTime() > LAST_SEEN_RESOLUTION_MS) {
    session.lastSeenAt = now;
    await session.save();
  }

  return {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    systemRole: user.systemRole,
    organizationId: organization._id.toString(),
    organizationName: organization.name,
    organizationStatus: organization.status,
    role: membership.role,
    sessionId: session._id.toString(),
  };
}

export async function listMyOrganizations(ctx: AuthContext) {
  await connectDb();
  const memberships = await Membership.find({ userId: ctx.userId }).sort({ createdAt: 1 }).lean();
  const organizations = await Organization.find({
    _id: { $in: memberships.map((m) => m.organizationId) },
  }).lean();
  const byId = new Map(organizations.map((o) => [o._id.toString(), o]));
  return memberships.flatMap((m) => {
    const org = byId.get(m.organizationId.toString());
    return org ? [{ id: org._id.toString(), name: org.name, role: m.role, status: org.status }] : [];
  });
}

export async function switchOrganization(ctx: AuthContext, organizationId: string): Promise<void> {
  await connectDb();
  if (!Types.ObjectId.isValid(organizationId)) throw new AppError("NOT_FOUND", "Organization not found.");
  const membership = await Membership.exists({ userId: ctx.userId, organizationId });
  if (!membership) throw new AppError("NOT_FOUND", "Organization not found.");
  await Session.updateOne({ _id: ctx.sessionId, userId: ctx.userId }, { activeOrganizationId: organizationId });
}
