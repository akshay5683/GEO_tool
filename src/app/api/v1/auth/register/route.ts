import { register } from "@/server/auth/service";
import { getClientInfo, setSessionCookie } from "@/server/auth/session";
import { readJson, route } from "@/server/http";

export const POST = route(async (request) => {
  const session = await register(await readJson(request), await getClientInfo());
  await setSessionCookie(session);
  return Response.json({ ok: true }, { status: 201 });
});
