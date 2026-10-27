import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";

/** Ordered from least to most privileged. */
export const ORG_ROLES = ["viewer", "member", "admin", "owner"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

const membershipSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ORG_ROLES, required: true },
  },
  { timestamps: true, collection: "memberships" },
);

membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1, createdAt: 1 });

export type MembershipDoc = InferSchemaType<typeof membershipSchema> & { _id: Types.ObjectId };
export const Membership =
  (models.Membership as Model<MembershipDoc>) ??
  model<MembershipDoc>("Membership", membershipSchema);
