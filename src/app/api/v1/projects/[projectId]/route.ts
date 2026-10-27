import { requireApiContext } from "@/server/auth/session";
import { route } from "@/server/http";
import { archiveProject, getProject } from "@/server/projects/service";

type Ctx = RouteContext<"/api/v1/projects/[projectId]">;

export const GET = route<Ctx>(async (_request, { params }) => {
  const ctx = await requireApiContext();
  const { projectId } = await params;
  return Response.json({ project: await getProject(ctx, projectId) });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const ctx = await requireApiContext();
  const { projectId } = await params;
  await archiveProject(ctx, projectId);
  return new Response(null, { status: 204 });
});
