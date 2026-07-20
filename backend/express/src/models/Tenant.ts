import mongoose, { Document, Schema } from "mongoose";

export interface ITenant extends Document {
  publicId: string;
  name: string;
  slug: string;
  plan: "trial" | "agency_starter" | "agency_pro" | "enterprise";
  status: "active" | "suspended";
  adminEmail: string;
  baselineSettings?: {
    manualHoursPerBatch: number;
    recruiterHourlyRateUSD: number;
    manualCostPerCandidateUSD: number;
  };
}

const tenantSchema = new Schema<ITenant>(
  {
    publicId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    plan: {
      type: String,
      enum: ["trial", "agency_starter", "agency_pro", "enterprise"],
      default: "trial"
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },
    adminEmail: { type: String, required: true },
    baselineSettings: {
      type: {
        manualHoursPerBatch: { type: Number, default: 16 },
        recruiterHourlyRateUSD: { type: Number, default: 35 },
        manualCostPerCandidateUSD: { type: Number, default: 12 }
      },
      default: { manualHoursPerBatch: 16, recruiterHourlyRateUSD: 35, manualCostPerCandidateUSD: 12 }
    }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>("Tenant", tenantSchema);

