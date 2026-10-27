import "server-only";
import { AppError } from "./errors";

/**
 * Server-side configuration. Values are read lazily so that a missing optional
 * integration produces a clear "not configured" state instead of crashing the
 * whole app at import time.
 */

export const isProduction = () => process.env.NODE_ENV === "production";

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new AppError(
      "CONFIG_MISSING",
      "Database is not configured. Set MONGODB_URI in .env.local (see .env.example).",
    );
  }
  return uri;
}

/** Exact browser origin, e.g. https://app.example.com. Required in production. */
export function getAppBaseUrl(): string | null {
  const value = process.env.APP_BASE_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export type ConfigItem = {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
  phase: string;
};

/** Presence-only status for the settings/admin UI. Never returns secret values. */
export function getConfigStatus(): ConfigItem[] {
  const has = (key: string) => Boolean(process.env[key]?.trim());
  return [
    { key: "MONGODB_URI", label: "MongoDB database", required: true, configured: has("MONGODB_URI"), phase: "Foundation" },
    {
      key: "APP_BASE_URL",
      label: "Public app origin",
      required: isProduction(),
      configured: getAppBaseUrl() !== null,
      phase: "Foundation",
    },
  ];
}
