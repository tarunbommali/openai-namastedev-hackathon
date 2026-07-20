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

export interface ICandidate extends Document {
  publicId: string;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
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
    publicId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    status: { type: String, default: "Ranked" },
    resumeText: { type: String, default: "" },
    parsedResume: { type: Schema.Types.Mixed },
    matchScore: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    explanation: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    location: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    certifications: { type: [String], default: [] },
    resumeVersions: { type: Array, default: [] }
  },
  { timestamps: true }
);

export const Candidate = mongoose.model<ICandidate>("Candidate", candidateSchema);
