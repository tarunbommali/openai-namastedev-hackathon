import { z } from "zod";

export const OFFER_STATUSES = ["Drafted", "Sent", "Accepted", "Rejected"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const offerSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  candidateId: z.string(),
  candidate: z.string(),
  jobId: z.string().default(""),
  subject: z.string(),
  body: z.string(),
  status: z.enum(OFFER_STATUSES).default("Drafted"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type OfferEntity = z.infer<typeof offerSchema>;
