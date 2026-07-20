import mongoose, { Document, Schema } from "mongoose";

export interface IAgentTrace {
  id: string;
  agent: string;
  model: string;
  status: string;
  mode: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  inputPreview?: string;
  outputSummary?: string;
  task?: string;
  tokens?: number;
  error?: string;
}

export interface IExecutionLog extends Document {
  executionId: string;
  source: string;
  status: string;
  totalDurationMs?: number;
  tokenUsage?: number;
  traces: IAgentTrace[];
  raw?: Record<string, unknown>;
  createdAt: Date;
}

const executionLogSchema = new Schema(
  {
    executionId: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "crewai" },
    status: { type: String, default: "completed" },
    totalDurationMs: Number,
    tokenUsage: Number,
    traces: { type: Array, default: [] },
    raw: { type: Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

executionLogSchema.index({ createdAt: -1 });
executionLogSchema.index({ "traces.agent": 1 });

export const ExecutionLog = mongoose.model<IExecutionLog>("ExecutionLog", executionLogSchema);
