import mongoose, { Document, Schema } from "mongoose";

/**
 * IJob
 * – Created by company_admin or recruiter (same org)
 * – Visible in Company Portal → Job Management (admin creates/closes)
 * – Visible in Recruiter Portal → Jobs & Weighting (recruiter edits scoring)
 * – Candidates apply via Application.jobId
 * – Interviewer sees job title in Interview Brief via Application → Job ref
 */
export interface IJob extends Document {
  publicId: string;
  title: string;
  location: string;
  team: string;
  department?: string;                          // e.g. "Engineering", "Product"
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salaryRange?: string;                         // e.g. "₹18L – ₹28L per annum"
  summary: string;
  requirements: string[];
  scoringWeights?: {
    skillMatch: number;
    experienceMatch: number;
    seniorityMatch: number;
  };
  createdBy?: mongoose.Types.ObjectId;          // company_admin or recruiter who posted
  assignedRecruiterId?: mongoose.Types.ObjectId; // Recruiter responsible for screening
  organizationId?: mongoose.Types.ObjectId;     // Company that owns this job
  isActive: boolean;
  closedAt?: Date;
}

const jobSchema = new Schema<IJob>(
  {
    publicId:      { type: String, required: true, unique: true },
    title:         { type: String, required: true },
    location:      { type: String, default: "" },
    team:          { type: String, default: "" },
    department:    { type: String, default: "" },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time"
    },
    salaryRange:   { type: String, default: "" },
    summary:       { type: String, default: "" },
    requirements:  { type: [String], default: [] },
    scoringWeights: {
      type: {
        skillMatch:       { type: Number, default: 50 },
        experienceMatch:  { type: Number, default: 30 },
        seniorityMatch:   { type: Number, default: 20 }
      },
      default: { skillMatch: 50, experienceMatch: 30, seniorityMatch: 20 }
    },
    createdBy:           { type: Schema.Types.ObjectId, ref: "User" },
    assignedRecruiterId: { type: Schema.Types.ObjectId, ref: "User" },
    organizationId:      { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    isActive:            { type: Boolean, default: true },
    closedAt:            { type: Date }
  },
  { timestamps: true }
);

// Company Portal: Job Management – org-scoped active job listing
jobSchema.index({ organizationId: 1, isActive: 1 });
// Recruiter Portal: Jobs & Weighting – by recruiter assignment
jobSchema.index({ assignedRecruiterId: 1, isActive: 1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
