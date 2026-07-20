import "express-async-errors";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { corsOrigins, env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { router } from "./routes";

import { tenantScope } from "./middlewares/tenantScope";
import { tenantQuotaMiddleware } from "./middlewares/tenantQuota";

export function createApp() {
  const app = express();
  app.use(helmet());
  const origins =
    corsOrigins.length > 0
      ? corsOrigins
      : env.NODE_ENV === "production"
        ? []
        : true;
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts, try again later" }
  });
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req as any).tenantId || req.ip || "global",
    message: { error: "Too many AI requests for this agency tenant, slow down" }
  });
  app.use("/api/auth", authLimiter);
  app.use("/api/command", tenantScope, tenantQuotaMiddleware, aiLimiter);
  app.use("/api/resumes", tenantScope, tenantQuotaMiddleware, aiLimiter);
  app.use("/api/recruiter/screen", tenantScope, tenantQuotaMiddleware, aiLimiter);
  app.use("/api/candidate/apply", aiLimiter);

  app.use("/api", tenantScope, router);
  app.use(errorHandler);
  return app;
}


