import { logout } from "@/server/auth/service";
import { clearSessionCookie, getSessionToken } from "@/server/auth/session";
import { route } from "@/server/http";

export const POST = route(async () => {
  const token = await getSessionToken();
  if (token) await logout(token);
  await clearSessionCookie();
  return Response.json({ ok: true });
});
