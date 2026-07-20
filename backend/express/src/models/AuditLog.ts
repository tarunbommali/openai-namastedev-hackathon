import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  publicId: string;
  tenantId: string;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  action: "screening_started" | "agent_executed" | "decision_generated" | "human_override";
  agentName?: string;
  inputsUsed?: Record<string, any>;
  outputGenerated?: Record<string, any>;
  humanOverrideDetails?: {
    originalVerdict?: string;
    newVerdict?: string;
    editedBy?: string;
    reason?: string;
  };
  explainabilityVerdict?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    publicId: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, default: "default-tenant", index: true },
    candidateId: { type: String, index: true },
    jobId: { type: String, index: true },
    applicationId: { type: String, index: true },
    action: {
      type: String,
      enum: ["screening_started", "agent_executed", "decision_generated", "human_override"],
      required: true
    },
    agentName: { type: String, default: "" },
    inputsUsed: { type: Schema.Types.Mixed, default: {} },
    outputGenerated: { type: Schema.Types.Mixed, default: {} },
    humanOverrideDetails: {
      type: {
        originalVerdict: String,
        newVerdict: String,
        editedBy: String,
        reason: String
      },
      default: null
    },
    explainabilityVerdict: { type: String, default: "" }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
