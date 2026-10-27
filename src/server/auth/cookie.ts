// Kept free of server-only imports so proxy.ts can use it.

// The __Host- prefix requires Secure, so it is only used over HTTPS in production.
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-ave_session" : "ave_session";

/** Only same-site relative paths are accepted as post-login destinations. */
export function safeNextPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value.slice(0, 500);
}
