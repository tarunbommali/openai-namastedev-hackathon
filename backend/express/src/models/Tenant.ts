import mongoose, { Document, Schema } from "mongoose";
import { TENANT_PLANS, TENANT_STATUSES } from "../schemas/tenant.schema";

export interface ITenant extends Document {
  publicId: string;
  name: string;
  slug: string;
  plan: (typeof TENANT_PLANS)[number];
  status: (typeof TENANT_STATUSES)[number];
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
      enum: TENANT_PLANS,
      default: "trial"
    },
    status: {
      type: String,
      enum: TENANT_STATUSES,
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

