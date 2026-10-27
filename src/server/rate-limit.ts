import "server-only";
import { connectDb } from "./db/connect";
import { RateLimit } from "./db/models";
import { AppError } from "./errors";

export type RateLimitRule = { limit: number; windowSeconds: number };

export function windowStartFor(now: Date, windowSeconds: number): Date {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / ms) * ms);
}

/**
 * Fixed-window counter stored in MongoDB so limits hold across serverless
 * instances. Throws RATE_LIMITED once the window's limit is exceeded.
 */
export async function consumeRateLimit(key: string, rule: RateLimitRule, now = new Date()): Promise<void> {
  await connectDb();
  const windowStart = windowStartFor(now, rule.windowSeconds);
  const expiresAt = new Date(windowStart.getTime() + rule.windowSeconds * 2000);
  const doc = await RateLimit.findOneAndUpdate(
    { key, windowStart },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  ).lean();
  if (doc && doc.count > rule.limit) {
    const retryAfter = Math.ceil((windowStart.getTime() + rule.windowSeconds * 1000 - now.getTime()) / 1000);
    throw new AppError("RATE_LIMITED", "Too many attempts. Please wait and try again.", { retryAfter });
  }
}

export const RATE_LIMITS = {
  loginPerIp: { limit: 20, windowSeconds: 15 * 60 },
  loginPerEmail: { limit: 8, windowSeconds: 15 * 60 },
  registerPerIp: { limit: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;
