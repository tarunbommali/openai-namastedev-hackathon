import mongoose, { Document, Schema } from "mongoose";
import { APPLICATION_STATUSES, ApplicationStatus } from "../schemas/application.schema";

export { APPLICATION_STATUSES };
export type { ApplicationStatus };

export interface IApplication extends Document {
  publicId: string;
  candidateId: string;
  jobId: string;
  organizationId?: mongoose.Types.ObjectId; // company that owns the job
  status: ApplicationStatus;
  matchScore: number;
  resumeScore?: number;
  notes?: string;
  humanOverride?: {
    isOverridden: boolean;
    originalVerdict: string;
    originalScore: number;
    newVerdict: string;
    newScore: number;
    editedBy?: string;
    reason?: string;
    timestamp?: Date;
  };
}

const applicationSchema = new Schema<IApplication>(
  {
    publicId: { type: String, required: true, unique: true },
    candidateId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Applied"
    },
    matchScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    humanOverride: {
      type: {
        isOverridden: { type: Boolean, default: false },
        originalVerdict: { type: String, default: "" },
        originalScore: { type: Number, default: 0 },
        newVerdict: { type: String, default: "" },
        newScore: { type: Number, default: 0 },
        editedBy: { type: String, default: "" },
        reason: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
      },
      default: null
    }
  },
  { timestamps: true }
);

// Compound index: org-scoped application listing
applicationSchema.index({ organizationId: 1, status: 1 });
applicationSchema.index({ organizationId: 1, jobId: 1 });

export const Application = mongoose.model<IApplication>("Application", applicationSchema);
