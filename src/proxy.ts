import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./server/auth/cookie";

/**
 * Optimistic check only: sends visitors without a session cookie to the login
 * page. Real authorization happens in the Data Access Layer on every request.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
