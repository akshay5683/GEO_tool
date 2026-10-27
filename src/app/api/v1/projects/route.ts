import { requireApiContext } from "@/server/auth/session";
import { readJson, route } from "@/server/http";
import { createProject, listProjects } from "@/server/projects/service";

export const GET = route(async () => {
  const ctx = await requireApiContext();
  return Response.json({ projects: await listProjects(ctx) });
});

export const POST = route(async (request) => {
  const ctx = await requireApiContext();
  const project = await createProject(ctx, await readJson(request));
  return Response.json({ project }, { status: 201 });
});
