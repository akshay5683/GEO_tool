// Grants the system administrator role to an existing account.
// Usage: npm run admin:grant -- user@example.com [--revoke]
import mongoose from "mongoose";

const email = process.argv[2]?.trim().toLowerCase();
const revoke = process.argv.includes("--revoke");
if (!email || !email.includes("@")) {
  console.error("Usage: npm run admin:grant -- user@example.com [--revoke]");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });
const result = await mongoose.connection
  .collection("users")
  .updateOne({ email }, { $set: { systemRole: revoke ? "user" : "admin", updatedAt: new Date() } });
await mongoose.disconnect();

if (result.matchedCount === 0) {
  console.error(`No account found for ${email}. Register it first.`);
  process.exit(1);
}
console.log(`${email} is now ${revoke ? "a regular user" : "a system administrator"}. Existing sessions pick this up on the next request.`);
