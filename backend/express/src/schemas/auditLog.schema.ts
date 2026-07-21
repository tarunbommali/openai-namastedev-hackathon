import { z } from "zod";

export const AUDIT_ACTIONS = [
  "screening_started",
  "agent_executed",
  "decision_generated",
  "human_override"
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const auditLogSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  tenantId: z.string().default("default-tenant"),
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  applicationId: z.string().optional(),
  action: z.enum(AUDIT_ACTIONS),
  agentName: z.string().default(""),
  inputsUsed: z.record(z.unknown()).default({}),
  outputGenerated: z.record(z.unknown()).default({}),
  humanOverrideDetails: z.object({
    originalVerdict: z.string().optional(),
    newVerdict: z.string().optional(),
    editedBy: z.string().optional(),
    reason: z.string().optional()
  }).optional(),
  explainabilityVerdict: z.string().default(""),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type AuditLogEntity = z.infer<typeof auditLogSchema>;
