import { requireApiContext } from "@/server/auth/session";
import { route } from "@/server/http";

export const GET = route(async () => {
  const ctx = await requireApiContext();
  return Response.json({
    user: { id: ctx.userId, name: ctx.name, email: ctx.email, systemRole: ctx.systemRole },
    organization: { id: ctx.organizationId, name: ctx.organizationName, role: ctx.role, status: ctx.organizationStatus },
  });
});
