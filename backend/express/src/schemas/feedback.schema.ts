import { z } from "zod";

export const feedbackRatingsSchema = z.object({
  technical: z.number().default(0),
  communication: z.number().default(0),
  problemSolving: z.number().default(0),
  cultureFit: z.number().default(0)
});

export const feedbackRecommendationSchema = z.object({
  recommendation: z.string(),
  reason: z.string(),
  confidence: z.number()
});

export const feedbackSchema = z.object({
  id: z.string().optional(),
  publicId: z.string(),
  interviewId: z.string().optional(),
  candidate: z.string(),
  interviewer: z.string(),
  feedbackText: z.string(),
  ratings: feedbackRatingsSchema.optional(),
  recommendation: feedbackRecommendationSchema,
  aiSummary: z.string().default(""),
  submittedBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type FeedbackEntity = z.infer<typeof feedbackSchema>;
