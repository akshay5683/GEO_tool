import "server-only";
import mongoose from "mongoose";
import { getMongoUri } from "../config";

type Cache = { promise: Promise<typeof mongoose> | null };

// Reuse one connection across hot reloads in development and across
// invocations of a warm serverless instance.
const globalCache = globalThis as typeof globalThis & { __mongoose?: Cache };
const cache: Cache = (globalCache.__mongoose ??= { promise: null });

export async function connectDb(): Promise<typeof mongoose> {
  if (!cache.promise) {
    const uri = getMongoUri();
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB?.trim() || undefined,
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
        // Unique indexes (emails, memberships, sessions) are part of the
        // correctness model, so they are always ensured. createIndex is
        // idempotent and never drops existing indexes.
        autoIndex: true,
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }
  return cache.promise;
}
