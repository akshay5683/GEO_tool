import { listUsers } from "@/server/admin/service";
import { requireAdminApiContext } from "@/server/auth/session";
import { route } from "@/server/http";

export const GET = route(async () => {
  const ctx = await requireAdminApiContext();
  return Response.json({ users: await listUsers(ctx) });
});
