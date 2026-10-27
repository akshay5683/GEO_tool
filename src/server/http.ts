import "server-only";
import { randomUUID } from "node:crypto";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { getAppBaseUrl } from "./config";
import { AppError } from "./errors";

export type ErrorBody = {
  error: { code: string; message: string; details?: unknown; requestId: string };
};

export function toErrorResponse(error: unknown, requestId: string): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: error.issues[0]?.message ?? "Invalid request.",
          details: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          requestId,
        },
      } satisfies ErrorBody,
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    const headers: HeadersInit = {};
    const retryAfter = (error.details as { retryAfter?: number } | undefined)?.retryAfter;
    if (error.code === "RATE_LIMITED" && retryAfter) headers["Retry-After"] = String(retryAfter);
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details, requestId } } satisfies ErrorBody,
      { status: error.status, headers },
    );
  }
  console.error(JSON.stringify({ level: "error", requestId, message: String(error), stack: (error as Error)?.stack }));
  return Response.json(
    { error: { code: "INTERNAL", message: "Something went wrong. Please try again.", requestId } } satisfies ErrorBody,
    { status: 500 },
  );
}

/**
 * Cookie-authenticated mutations must come from our own origin. SameSite=Lax
 * already blocks most cross-site requests; this is defense in depth.
 */
export function assertSameOrigin(request: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  const expected = getAppBaseUrl() ?? new URL(request.url).origin;
  if (!origin || origin !== expected) {
    throw new AppError("FORBIDDEN", "Cross-origin request rejected.");
  }
}

export async function readJson(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new AppError("VALIDATION_FAILED", "Expected an application/json request body.");
  }
  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDATION_FAILED", "Request body is not valid JSON.");
  }
}

type Handler<C> = (request: Request, context: C, requestId: string) => Promise<Response>;

/** Wraps a Route Handler with a request id, origin check and consistent error responses. */
export function route<C = unknown>(handler: Handler<C>) {
  return async (request: Request, context: C): Promise<Response> => {
    const requestId = randomUUID();
    try {
      assertSameOrigin(request);
      const response = await handler(request, context, requestId);
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      // Let Next.js control-flow signals (prerender bailouts, redirects) propagate.
      unstable_rethrow(error);
      const response = toErrorResponse(error, requestId);
      response.headers.set("x-request-id", requestId);
      return response;
    }
  };
}
