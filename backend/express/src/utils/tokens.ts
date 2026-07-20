import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/User";

export interface AccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
  organizationId?: string;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"]
  });
}

export function signRefreshToken(payload: AccessPayload): string {
  const noncePayload = {
    ...payload,
    jti: crypto.randomBytes(16).toString("hex")
  };
  return jwt.sign(noncePayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions["expiresIn"]
  });
}


export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshExpiryDate(): Date {
  const match = /^(\d+)([dhms])$/.exec(env.JWT_REFRESH_EXPIRES);
  const now = Date.now();
  if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000);
  const n = Number(match[1]);
  const unit = match[2];
  const ms =
    unit === "d" ? n * 86400000 : unit === "h" ? n * 3600000 : unit === "m" ? n * 60000 : n * 1000;
  return new Date(now + ms);
}
