import mongoose, { Document, Schema } from "mongoose";

export interface IOrganization extends Document {
  publicId: string;
  name: string;
  domain?: string;
  industry: string;
  size: string;
  country: string;
  adminEmail: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    publicId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, trim: true, lowercase: true },
    industry: { type: String, required: true, trim: true },
    size: { type: String, required: true },
    country: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ["trial", "starter", "pro", "enterprise"],
      default: "trial"
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    }
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>("Organization", organizationSchema);
