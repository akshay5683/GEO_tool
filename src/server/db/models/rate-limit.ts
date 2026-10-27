import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { collection: "rateLimits" },
);

rateLimitSchema.index({ key: 1, windowStart: 1 }, { unique: true });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDoc = InferSchemaType<typeof rateLimitSchema> & { _id: Types.ObjectId };
export const RateLimit =
  (models.RateLimit as Model<RateLimitDoc>) ?? model<RateLimitDoc>("RateLimit", rateLimitSchema);
