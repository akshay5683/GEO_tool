import { getAdminOverview } from "@/server/admin/service";
import { requireAdminApiContext } from "@/server/auth/session";
import { getConfigStatus } from "@/server/config";
import { route } from "@/server/http";

export const GET = route(async () => {
  const ctx = await requireAdminApiContext();
  return Response.json({ overview: await getAdminOverview(ctx), configuration: getConfigStatus() });
});
