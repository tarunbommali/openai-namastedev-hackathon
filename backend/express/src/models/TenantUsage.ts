import mongoose, { Document, Schema } from "mongoose";

export interface ITenantUsage extends Document {
  tenantId: string;
  monthYear: string;
  aiPipelineRuns: number;
  resumesProcessed: number;
  activeRecruiterSeats: number;
}

const tenantUsageSchema = new Schema<ITenantUsage>(
  {
    tenantId: { type: String, required: true, index: true },
    monthYear: { type: String, required: true },
    aiPipelineRuns: { type: Number, default: 0 },
    resumesProcessed: { type: Number, default: 0 },
    activeRecruiterSeats: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const TenantUsage = mongoose.model<ITenantUsage>("TenantUsage", tenantUsageSchema);
