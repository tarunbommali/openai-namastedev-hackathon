import mongoose, { Document, Schema } from "mongoose";

/**
 * Company-side roles:  company_admin | recruiter | interviewer
 * Developer-side role: developer
 * Legacy aliases kept for backward compat: candidate (= developer), admin (= company_admin)
 */
export type UserRole =
  | "company_admin"
  | "recruiter"
  | "interviewer"
  | "developer"
  | "candidate"   // legacy alias — treated as developer
  | "admin";      // legacy alias — treated as company_admin

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId;  // null for developers
  isActive: boolean;
  tokenVersion: number;
  mustChangePassword?: boolean;              // set when admin creates/invites user
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["company_admin", "recruiter", "interviewer", "developer", "candidate", "admin"],
      required: true
    },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    mustChangePassword: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index for fast org-scoped queries
userSchema.index({ organizationId: 1, role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
