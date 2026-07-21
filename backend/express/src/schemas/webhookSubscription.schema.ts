import { z } from "zod";

export const WEBHOOK_EVENTS = [
  "job.created",
  "candidate.screened",
  "decision.made",
  "offer.sent"
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const webhookSubscriptionSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  tenantId: z.string().default("default-tenant"),
  url: z.string().url(),
  secret: z.string(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).default(["candidate.screened", "decision.made"]),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type WebhookSubscriptionEntity = z.infer<typeof webhookSubscriptionSchema>;
