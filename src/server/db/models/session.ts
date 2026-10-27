import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

/**
 * Server-side sessions. Only a SHA-256 hash of the opaque cookie token is
 * stored, so a database read does not reveal usable session tokens.
 */
const sessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activeOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    userAgent: { type: String, maxlength: 400, default: "" },
  },
  { timestamps: true, collection: "sessions" },
);

sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
// MongoDB removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDoc = InferSchemaType<typeof sessionSchema> & { _id: Types.ObjectId };
export const Session =
  (models.Session as Model<SessionDoc>) ?? model<SessionDoc>("Session", sessionSchema);
