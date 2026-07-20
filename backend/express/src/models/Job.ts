import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  publicId: string;
  title: string;
  location: string;
  team: string;
  summary: string;
  requirements: string[];
  scoringWeights?: {
    skillMatch: number;
    experienceMatch: number;
    seniorityMatch: number;
  };
  createdBy?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId; // company that owns this job
  isActive: boolean;
}

const jobSchema = new Schema<IJob>(
  {
    publicId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    team: { type: String, default: "" },
    summary: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    scoringWeights: {
      type: {
        skillMatch: { type: Number, default: 50 },
        experienceMatch: { type: Number, default: 30 },
        seniorityMatch: { type: Number, default: 20 }
      },
      default: { skillMatch: 50, experienceMatch: 30, seniorityMatch: 20 }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true }
  },
  { timestamps: true }
);

// Compound index: org scoped active-job queries
jobSchema.index({ organizationId: 1, isActive: 1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
