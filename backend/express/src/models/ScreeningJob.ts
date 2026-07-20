import mongoose, { Document, Schema } from "mongoose";

export interface IScreeningJob extends Document {
  publicId: string;
  tenantId: string;
  jobId: string;
  candidateIds: string[];
  status: "queued" | "processing" | "completed" | "failed";
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
      enum: ["queued", "processing", "completed", "failed"],
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
