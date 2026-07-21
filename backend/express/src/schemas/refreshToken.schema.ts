import { z } from "zod";

export const refreshTokenSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  tokenHash: z.string(),
  expiresAt: z.date(),
  revoked: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type RefreshTokenEntity = z.infer<typeof refreshTokenSchema>;
