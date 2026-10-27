import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

export const SYSTEM_ROLES = ["user", "admin"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "suspended"] as const;

const userSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false },
    systemRole: { type: String, enum: SYSTEM_ROLES, default: "user", required: true },
    status: { type: String, enum: ACCOUNT_STATUSES, default: "active", required: true },
    suspendedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const User = (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
