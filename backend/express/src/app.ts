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
  const corsDelegate: cors.CorsOptionsDelegate<express.Request> = (req, callback) => {
    const originHeader = req.header("Origin");

    // 1. Same-origin or non-browser request (Postman, curl, server-to-server)
    if (!originHeader) {
      return callback(null, { origin: true, credentials: true });
    }

    // 2. Wildcard '*' or empty/default list fallback
    if (corsOrigins.includes("*") || corsOrigins.length === 0) {
      return callback(null, { origin: originHeader, credentials: true });
    }

    // 3. Exact match from allowed CORS_ORIGINS list
    if (corsOrigins.includes(originHeader)) {
      return callback(null, { origin: originHeader, credentials: true });
    }

    // 4. Wildcard subdomain match (e.g. *.domain.com)
    const isAllowedSubdomain = corsOrigins.some((allowed) => {
      if (allowed.startsWith("*.")) {
        const domain = allowed.slice(2);
        return originHeader.endsWith("." + domain) || originHeader === `https://${domain}`;
      }
      return false;
    });

    if (isAllowedSubdomain) {
      return callback(null, { origin: originHeader, credentials: true });
    }

    // 5. Fallback for disallowed origins
    return callback(null, { origin: false, credentials: true });
  };

  app.use(cors(corsDelegate));
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


