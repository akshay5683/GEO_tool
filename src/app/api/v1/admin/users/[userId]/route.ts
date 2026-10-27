import { z } from "zod";
import { setUserStatus } from "@/server/admin/service";
import { requireAdminApiContext } from "@/server/auth/session";
import { readJson, route } from "@/server/http";

const bodySchema = z.object({ status: z.enum(["active", "suspended"]) });

export const PATCH = route<RouteContext<"/api/v1/admin/users/[userId]">>(async (request, { params }) => {
  const ctx = await requireAdminApiContext();
  const { userId } = await params;
  const { status } = bodySchema.parse(await readJson(request));
  await setUserStatus(ctx, userId, status);
  return Response.json({ ok: true });
});
