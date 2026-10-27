import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { ACCOUNT_STATUSES } from "./user";

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, default: "free", required: true },
    status: { type: String, enum: ACCOUNT_STATUSES, default: "active", required: true },
    suspendedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "organizations" },
);

export type OrganizationDoc = InferSchemaType<typeof organizationSchema> & { _id: Types.ObjectId };
export const Organization =
  (models.Organization as Model<OrganizationDoc>) ??
  model<OrganizationDoc>("Organization", organizationSchema);
