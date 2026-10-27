export type ErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "CONFIG_MISSING"
  | "ACCOUNT_SUSPENDED"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  CONFIG_MISSING: 503,
  ACCOUNT_SUSPENDED: 403,
  INTERNAL: 500,
};

/** An error whose message is safe to show to the caller. */
export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.status = STATUS[code];
  }
}

export const notFound = (what = "Resource") => new AppError("NOT_FOUND", `${what} not found.`);
export const forbidden = (message = "You do not have permission to do that.") =>
  new AppError("FORBIDDEN", message);
export const unauthenticated = () => new AppError("UNAUTHENTICATED", "Sign in to continue.");
