import "server-only";
import { objectIdSchema } from "@/lib/validation";
import { requireSystemAdmin, type AuthContext } from "../auth/rbac";
import { connectDb } from "../db/connect";
import { Membership, Organization, Project, Session, User } from "../db/models";
import { AppError, notFound } from "../errors";

export async function getAdminOverview(ctx: AuthContext) {
  requireSystemAdmin(ctx);
  await connectDb();
  const [users, suspendedUsers, organizations, projects, activeSessions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "suspended" }),
    Organization.countDocuments(),
    Project.countDocuments({ status: "active" }),
    Session.countDocuments({ expiresAt: { $gt: new Date() } }),
  ]);
  return { users, suspendedUsers, organizations, projects, activeSessions };
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  systemRole: string;
  status: string;
  organizations: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export async function listUsers(ctx: AuthContext, limit = 100): Promise<AdminUserRow[]> {
  requireSystemAdmin(ctx);
  await connectDb();
  const users = await User.find().sort({ createdAt: -1 }).limit(Math.min(limit, 500)).lean();
  const counts = await Membership.aggregate<{ _id: unknown; n: number }>([
    { $match: { userId: { $in: users.map((u) => u._id) } } },
    { $group: { _id: "$userId", n: { $sum: 1 } } },
  ]);
  const byUser = new Map(counts.map((c) => [String(c._id), c.n]));
  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    systemRole: u.systemRole,
    status: u.status,
    organizations: byUser.get(u._id.toString()) ?? 0,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));
}

export async function setUserStatus(ctx: AuthContext, userId: string, status: "active" | "suspended") {
  requireSystemAdmin(ctx);
  const id = objectIdSchema.safeParse(userId);
  if (!id.success) throw notFound("User");
  if (id.data === ctx.userId) {
    throw new AppError("VALIDATION_FAILED", "You cannot change the status of your own account.");
  }
  await connectDb();
  const result = await User.updateOne(
    { _id: id.data },
    { status, suspendedAt: status === "suspended" ? new Date() : null },
  );
  if (result.matchedCount === 0) throw notFound("User");
  // Suspension takes effect immediately: drop all of the user's sessions.
  if (status === "suspended") await Session.deleteMany({ userId: id.data });
}
