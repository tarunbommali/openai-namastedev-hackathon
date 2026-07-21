import mongoose, { Document, Schema } from "mongoose";

export interface IParsedResume {
  name: string;
  skills: string[];
  experienceYears: number;
  seniority: string;
  domain: string;
  education: string;
  achievements: string[];
  roleSignals: string[];
  relevantProjects: string[];
  technologies?: string[];
  leadership?: string[];
}

/**
 * ICandidate
 * – Self-registered candidates have userId + optional organizationId (if applied to a company job)
 * – Sourced candidates (via recruiter bulk upload) may not have a userId
 * – Syncs with Recruiter Portal (Screening Results, Decisions & Offers) and
 *   Interviewer Portal (Interview Brief) via Application.candidateId
 * – Visible in Company Portal → Candidate Pipeline via org-scoped queries
 */
export interface ICandidate extends Document {
  publicId: string;
  userId?: mongoose.Types.ObjectId;         // linked User account (self-registered candidates)
  organizationId?: mongoose.Types.ObjectId; // org that this pipeline entry belongs to
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  whoami?: string;                          // short role tagline (≤ 30 chars)
  bio?: string;                             // "Describe Me" profile summary
  describeMe?: string;                      // alias for bio
  status: string;
  resumeText: string;
  parsedResume?: IParsedResume;
  matchScore: number;
  confidence: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  location?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  resumeVersions?: Array<{ at: string; preview: string }>;
}

const candidateSchema = new Schema<ICandidate>(
  {
    publicId:       { type: String, required: true, unique: true },
    userId:         { type: Schema.Types.ObjectId, ref: "User" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    name:           { type: String, required: true },
    firstName:      { type: String, trim: true, default: "" },
    lastName:       { type: String, trim: true, default: "" },
    email:          { type: String, default: "" },
    whoami:         { type: String, trim: true, maxlength: 30, default: "" },
    bio:            { type: String, default: "" },
    describeMe:     { type: String, default: "" },
    status:         { type: String, default: "Ranked" },
    resumeText:     { type: String, default: "" },
    parsedResume:   { type: Schema.Types.Mixed },
    matchScore:     { type: Number, default: 0 },
    confidence:     { type: Number, default: 0 },
    explanation:    { type: String, default: "" },
    strengths:      { type: [String], default: [] },
    gaps:           { type: [String], default: [] },
    location:       { type: String, default: "" },
    skills:         { type: [String], default: [] },
    experience:     { type: String, default: "" },
    education:      { type: String, default: "" },
    certifications: { type: [String], default: [] },
    resumeVersions: { type: Array, default: [] }
  },
  { timestamps: true }
);

// Company Portal: Candidate Pipeline tab – org-scoped queries
candidateSchema.index({ organizationId: 1, matchScore: -1 });
// Recruiter Portal: Screening Results sorted by match score
candidateSchema.index({ matchScore: -1, status: 1 });

export const Candidate = mongoose.model<ICandidate>("Candidate", candidateSchema);
