import { z } from "zod";

export const agentTraceSchema = z.object({
  id: z.string(),
  agent: z.string(),
  model: z.string(),
  status: z.string(),
  mode: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMs: z.number(),
  inputPreview: z.string().optional(),
  outputSummary: z.string().optional(),
  task: z.string().optional(),
  tokens: z.number().optional(),
  error: z.string().optional()
});

export const executionLogSchema = z.object({
  id: z.string().optional(),
  executionId: z.string(),
  source: z.string().default("crewai"),
  status: z.string().default("completed"),
  totalDurationMs: z.number().optional(),
  tokenUsage: z.number().optional(),
  traces: z.array(agentTraceSchema).default([]),
  raw: z.record(z.unknown()).optional(),
  createdAt: z.date().optional()
});

export type ExecutionLogEntity = z.infer<typeof executionLogSchema>;
export type AgentTraceEntity = z.infer<typeof agentTraceSchema>;
