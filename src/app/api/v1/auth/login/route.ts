import { login } from "@/server/auth/service";
import { getClientInfo, setSessionCookie } from "@/server/auth/session";
import { readJson, route } from "@/server/http";

export const POST = route(async (request) => {
  const session = await login(await readJson(request), await getClientInfo());
  await setSessionCookie(session);
  return Response.json({ ok: true });
});
