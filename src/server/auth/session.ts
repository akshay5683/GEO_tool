import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { isProduction } from "../config";
import { unauthenticated } from "../errors";
import { SESSION_COOKIE } from "./cookie";
import { requireSystemAdmin, type AuthContext } from "./rbac";
import { SESSION_TTL_SECONDS, resolveSession, type ClientInfo, type IssuedSession } from "./service";

/**
 * Data Access Layer for the current request: reads the session cookie and
 * resolves it against the database. Every page, Server Action and Route
 * Handler that touches customer data goes through these helpers.
 */


export async function getClientInfo(): Promise<ClientInfo> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || h.get("x-real-ip") || "unknown",
    userAgent: h.get("user-agent") ?? "",
  };
}

export async function setSessionCookie(session: IssuedSession): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: session.expiresAt,
  });
}

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Current caller or null. Deduplicated per request. */
export const getCurrentContext = cache(async (): Promise<AuthContext | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  // Session checks hit the database and the clock, so they must run against a
  // real request, never inside a prerender or prefetch.
  await connection();
  return resolveSession(token);
});

/** For pages: redirects to login when there is no valid session. */
export async function requirePageContext(): Promise<AuthContext> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireAdminPageContext(): Promise<AuthContext> {
  const ctx = await requirePageContext();
  if (ctx.systemRole !== "admin") redirect("/dashboard");
  return ctx;
}

/** For Route Handlers and Server Actions: throws instead of redirecting. */
export async function requireApiContext(): Promise<AuthContext> {
  const ctx = await getCurrentContext();
  if (!ctx) throw unauthenticated();
  return ctx;
}

export async function requireAdminApiContext(): Promise<AuthContext> {
  const ctx = await requireApiContext();
  requireSystemAdmin(ctx);
  return ctx;
}
