import { connectDb } from "@/server/db/connect";
import { route } from "@/server/http";

/** Public liveness check. Reports database reachability, never configuration values. */
export const GET = route(async () => {
  let database: "ok" | "not_configured" | "unreachable" = "ok";
  if (!process.env.MONGODB_URI) {
    database = "not_configured";
  } else {
    try {
      const mongoose = await connectDb();
      await mongoose.connection.db?.admin().ping();
    } catch {
      database = "unreachable";
    }
  }
  return Response.json({ status: database === "ok" ? "ok" : "degraded", database }, { status: database === "ok" ? 200 : 503 });
});
