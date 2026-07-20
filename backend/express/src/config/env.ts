import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/hireflow"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default(process.env.NODE_ENV === "production" ? "" : "dev-access-secret-change-me-32"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default(process.env.NODE_ENV === "production" ? "" : "dev-refresh-secret-change-me-32"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  AI_SERVICE_URL: z.string().default("http://localhost:8001"),
  AI_TIMEOUT_MS: z.coerce.number().default(120_000),
  AI_MAX_RETRIES: z.coerce.number().default(2),
  ALLOW_AI_FALLBACK: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:3000"),
  SEED_ON_BOOT: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0")
});

export const env = schema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
