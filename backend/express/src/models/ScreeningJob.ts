import mongoose, { Document, Schema } from "mongoose";
import { SCREENING_JOB_STATUSES } from "../schemas/screeningJob.schema";

export interface IScreeningJob extends Document {
  publicId: string;
  tenantId: string;
  jobId: string;
  candidateIds: string[];
  status: (typeof SCREENING_JOB_STATUSES)[number];
  progress: number;
  processedCount: number;
  totalCount: number;
  results: Array<{
    candidateId: string;
    score: number;
    verdict: string;
    error?: string;
  }>;
  error?: string;
}

const screeningJobSchema = new Schema<IScreeningJob>(
  {
    publicId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, default: "default-tenant", index: true },
    jobId: { type: String, required: true },
    candidateIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: SCREENING_JOB_STATUSES,
      default: "queued"
    },
    progress: { type: Number, default: 0 },
    processedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    results: {
      type: [
        {
          candidateId: String,
          score: Number,
          verdict: String,
          error: String
        }
      ],
      default: []
    },
    error: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ScreeningJob = mongoose.model<IScreeningJob>(
  "ScreeningJob",
  screeningJobSchema
);
