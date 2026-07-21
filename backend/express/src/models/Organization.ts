import mongoose, { Document, Schema } from "mongoose";
import { ORGANIZATION_PLANS, ORGANIZATION_STATUSES } from "../schemas/organization.schema";

export interface ICompanySettings {
  companyDisplayName?: string;   // overrides org name in Company Portal sidebar
  tagline?: string;              // WhoAmI shown below company name (≤ 30 chars)
  logoUrl?: string;
  primaryColor?: string;
  defaultJobLocation?: string;
  maxOpenJobs: number;
  allowCandidateSelfApply: boolean;
  requireResumeOnApply: boolean;
}

export interface IOrganization extends Document {
  publicId: string;
  name: string;
  domain?: string;
  industry: string;
  size: string;
  country: string;
  adminEmail: string;
  plan: (typeof ORGANIZATION_PLANS)[number];
  status: (typeof ORGANIZATION_STATUSES)[number];
  settings?: ICompanySettings;  // Company Portal → Company Settings tab
  createdAt: Date;
  updatedAt: Date;
}

const companySettingsSchema = new Schema<ICompanySettings>(
  {
    companyDisplayName:      { type: String, trim: true, maxlength: 80 },
    tagline:                 { type: String, trim: true, maxlength: 30, default: "" },
    logoUrl:                 { type: String },
    primaryColor:            { type: String },
    defaultJobLocation:      { type: String, trim: true },
    maxOpenJobs:             { type: Number, default: 50, min: 1 },
    allowCandidateSelfApply: { type: Boolean, default: true },
    requireResumeOnApply:    { type: Boolean, default: true }
  },
  { _id: false }
);

const organizationSchema = new Schema<IOrganization>(
  {
    publicId:   { type: String, required: true, unique: true },
    name:       { type: String, required: true, trim: true },
    domain:     { type: String, trim: true, lowercase: true },
    industry:   { type: String, required: true, trim: true },
    size:       { type: String, required: true },
    country:    { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ORGANIZATION_PLANS,
      default: "trial"
    },
    status: {
      type: String,
      enum: ORGANIZATION_STATUSES,
      default: "active"
    },
    settings: { type: companySettingsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>("Organization", organizationSchema);
