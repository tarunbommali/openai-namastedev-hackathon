import { z } from "zod";

export const TENANT_PLANS = ["trial", "agency_starter", "agency_pro", "enterprise"] as const;
export const TENANT_STATUSES = ["active", "suspended"] as const;

export const baselineSettingsSchema = z.object({
  manualHoursPerBatch: z.number().default(16),
  recruiterHourlyRateUSD: z.number().default(35),
  manualCostPerCandidateUSD: z.number().default(12)
});

export const tenantSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.enum(TENANT_PLANS).default("trial"),
  status: z.enum(TENANT_STATUSES).default("active"),
  adminEmail: z.string(),
  baselineSettings: baselineSettingsSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type TenantEntity = z.infer<typeof tenantSchema>;
