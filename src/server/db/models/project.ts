import { Schema, model, models, type InferSchemaType, type Model, type Types } from "mongoose";
import { COUNTRY_CODES, LANGUAGE_CODES } from "@/lib/markets";

export const PROJECT_STATUSES = ["active", "archived"] as const;

const projectSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    domain: { type: String, required: true, lowercase: true, trim: true, maxlength: 253 },
    country: { type: String, enum: COUNTRY_CODES, required: true },
    languages: { type: [{ type: String, enum: LANGUAGE_CODES }], required: true },
    status: { type: String, enum: PROJECT_STATUSES, default: "active", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "projects" },
);

// One project per domain and market within an organization.
projectSchema.index({ organizationId: 1, domain: 1, country: 1 }, { unique: true });
projectSchema.index({ organizationId: 1, createdAt: -1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema> & { _id: Types.ObjectId };
export const Project =
  (models.Project as Model<ProjectDoc>) ?? model<ProjectDoc>("Project", projectSchema);
