import "server-only";
import { Types } from "mongoose";
import { createProjectSchema, objectIdSchema } from "@/lib/validation";
import { requireActiveOrganization, requireOrgRole, type AuthContext } from "../auth/rbac";
import { connectDb } from "../db/connect";
import { Project, type ProjectDoc } from "../db/models";
import { AppError, notFound } from "../errors";

export type ProjectView = {
  id: string;
  name: string;
  domain: string;
  country: string;
  languages: string[];
  status: string;
  createdAt: string;
};

function toView(doc: ProjectDoc): ProjectView {
  return {
    id: doc._id.toString(),
    name: doc.name,
    domain: doc.domain,
    country: doc.country,
    languages: [...doc.languages],
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

/** Every project query is constrained to the caller's active organization. */
function scoped(ctx: AuthContext, filter: Record<string, unknown> = {}) {
  return { ...filter, organizationId: new Types.ObjectId(ctx.organizationId) };
}

export async function listProjects(ctx: AuthContext): Promise<ProjectView[]> {
  await connectDb();
  const docs = await Project.find(scoped(ctx, { status: "active" })).sort({ createdAt: -1 }).limit(200).lean();
  return docs.map(toView);
}

export async function getProject(ctx: AuthContext, id: string): Promise<ProjectView> {
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) throw notFound("Project");
  await connectDb();
  const doc = await Project.findOne(scoped(ctx, { _id: parsed.data })).lean();
  // Another organization's project is indistinguishable from a missing one.
  if (!doc) throw notFound("Project");
  return toView(doc);
}

export async function createProject(ctx: AuthContext, input: unknown): Promise<ProjectView> {
  requireOrgRole(ctx, "member");
  requireActiveOrganization(ctx);
  const data = createProjectSchema.parse(input);
  await connectDb();
  try {
    const doc = await Project.create({
      organizationId: ctx.organizationId,
      name: data.name || data.domain,
      domain: data.domain,
      country: data.country,
      languages: data.languages,
      createdBy: ctx.userId,
    });
    return toView(doc.toObject());
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError("CONFLICT", `A project for ${data.domain} in this market already exists.`);
    }
    throw error;
  }
}

export async function archiveProject(ctx: AuthContext, id: string): Promise<void> {
  requireOrgRole(ctx, "admin");
  requireActiveOrganization(ctx);
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) throw notFound("Project");
  await connectDb();
  const result = await Project.updateOne(scoped(ctx, { _id: parsed.data }), { status: "archived" });
  if (result.matchedCount === 0) throw notFound("Project");
}
