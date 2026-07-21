import { z } from "zod";

export const ORGANIZATION_PLANS = ["trial", "starter", "pro", "enterprise"] as const;
export const ORGANIZATION_STATUSES = ["active", "suspended"] as const;

/**
 * Company Settings  – what the company admin can configure
 * and what is displayed in the Company Portal sidebar header.
 */
export const companySettingsSchema = z.object({
  companyDisplayName: z.string().trim().max(80).optional(),   // overrides org name in portal header
  tagline: z.string().trim().max(30).optional(),              // WhoAmI / tagline shown below company name
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),                         // e.g. "#4f46e5"
  defaultJobLocation: z.string().trim().optional(),
  maxOpenJobs: z.number().int().min(1).default(50),
  allowCandidateSelfApply: z.boolean().default(true),
  requireResumeOnApply: z.boolean().default(true)
});

export const organizationSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  name: z.string().trim(),
  domain: z.string().trim().toLowerCase().optional(),
  industry: z.string().trim(),
  size: z.string(),
  country: z.string().trim(),
  adminEmail: z.string().trim().toLowerCase().email(),
  plan: z.enum(ORGANIZATION_PLANS).default("trial"),
  status: z.enum(ORGANIZATION_STATUSES).default("active"),
  settings: companySettingsSchema.optional(),                  // Company Portal settings
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type OrganizationEntity = z.infer<typeof organizationSchema>;
export type CompanySettings = z.infer<typeof companySettingsSchema>;
