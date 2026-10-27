import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "@/server/errors";
import { assertSameOrigin, route, toErrorResponse } from "@/server/http";
import { windowStartFor } from "@/server/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("toErrorResponse", () => {
  it("maps validation errors to 400 with field details", async () => {
    const parsed = z.object({ domain: z.string() }).safeParse({});
    const response = toErrorResponse(parsed.error, "req-1");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.details[0].path).toBe("domain");
    expect(body.error.requestId).toBe("req-1");
  });

  it("maps AppError codes to statuses and sets Retry-After", async () => {
    const response = toErrorResponse(new AppError("RATE_LIMITED", "slow down", { retryAfter: 30 }), "r");
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("30");
    expect(toErrorResponse(new AppError("NOT_FOUND", "x"), "r").status).toBe(404);
    expect(toErrorResponse(new AppError("CONFIG_MISSING", "x"), "r").status).toBe(503);
  });

  it("hides unexpected error details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = toErrorResponse(new Error("connection string mongodb://secret"), "r");
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});

describe("assertSameOrigin", () => {
  const post = (origin?: string) =>
    new Request("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: origin ? { origin } : {},
    });

  it("allows same-origin mutations and all safe methods", () => {
    expect(() => assertSameOrigin(post("http://localhost:3000"))).not.toThrow();
    expect(() => assertSameOrigin(new Request("http://localhost:3000/api/v1/projects"))).not.toThrow();
  });

  it("rejects cross-origin or origin-less mutations", () => {
    expect(() => assertSameOrigin(post("https://evil.example"))).toThrow(AppError);
    expect(() => assertSameOrigin(post())).toThrow(AppError);
  });

  it("uses APP_BASE_URL when configured", () => {
    vi.stubEnv("APP_BASE_URL", "https://app.example.com");
    expect(() => assertSameOrigin(post("http://localhost:3000"))).toThrow(AppError);
  });
});

describe("route wrapper", () => {
  it("adds a request id and converts thrown errors", async () => {
    const handler = route(async () => {
      throw new AppError("FORBIDDEN", "nope");
    });
    const response = await handler(new Request("http://localhost/api"), {});
    expect(response.status).toBe(403);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("windowStartFor", () => {
  it("aligns to fixed windows", () => {
    const now = new Date("2026-01-01T10:07:30Z");
    expect(windowStartFor(now, 900).toISOString()).toBe("2026-01-01T10:00:00.000Z");
    expect(windowStartFor(now, 3600).toISOString()).toBe("2026-01-01T10:00:00.000Z");
  });
});
