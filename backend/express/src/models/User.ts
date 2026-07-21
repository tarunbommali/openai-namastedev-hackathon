import mongoose, { Document, Schema } from "mongoose";
import { UserRole, USER_ROLES } from "../schemas/user.schema";

export type { UserRole };

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  firstName?: string;               // structured given name
  lastName?: string;                // structured family name
  whoami?: string;                  // short tagline / role identity (≤ 30 chars)
  tagline?: string;                 // alias for whoami
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId;   // null for self-registered candidates
  isActive: boolean;
  tokenVersion: number;
  mustChangePassword?: boolean;     // set when company_admin creates/invites a team member
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:     { type: String, required: true },
    name:             { type: String, required: true, trim: true },
    firstName:        { type: String, trim: true, default: "" },
    lastName:         { type: String, trim: true, default: "" },
    whoami:           { type: String, trim: true, maxlength: 30, default: "" },
    tagline:          { type: String, trim: true, maxlength: 30, default: "" },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true
    },
    organizationId:   { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    isActive:         { type: Boolean, default: true },
    tokenVersion:     { type: Number, default: 0 },
    mustChangePassword: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for fast org-scoped queries (Company Portal: Employees & Team tab)
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ organizationId: 1, isActive: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
