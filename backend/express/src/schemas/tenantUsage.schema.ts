import { z } from "zod";

export const tenantUsageSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  monthYear: z.string(),
  aiPipelineRuns: z.number().default(0),
  resumesProcessed: z.number().default(0),
  activeRecruiterSeats: z.number().default(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type TenantUsageEntity = z.infer<typeof tenantUsageSchema>;
