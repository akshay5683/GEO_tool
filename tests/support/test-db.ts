import mongoose from "mongoose";

/**
 * Provides a disposable MongoDB for integration tests:
 *  - MONGODB_TEST_URI (CI service container or a local server), or
 *  - an in-memory server downloaded by mongodb-memory-server.
 * Returns null when neither is available. Set REQUIRE_DB_TESTS=1 (as CI does)
 * to turn that into a hard failure instead of a skip.
 */
export async function startTestDb(name: string): Promise<{ stop: () => Promise<void> } | null> {
  const dbName = `ave_test_${name}_${process.pid}_${Date.now()}`;
  let uri = process.env.MONGODB_TEST_URI;
  let stopServer = async () => {};

  if (!uri) {
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const server = await MongoMemoryServer.create();
      uri = server.getUri();
      stopServer = async () => void (await server.stop());
    } catch (error) {
      if (process.env.REQUIRE_DB_TESTS === "1") throw error;
      console.warn(`[integration] Skipping ${name}: no MongoDB available (${(error as Error).message.split("\n")[0]})`);
      return null;
    }
  }

  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB = dbName;
  return {
    stop: async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
      await stopServer();
    },
  };
}
