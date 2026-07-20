import axios, { AxiosError, AxiosInstance } from "axios";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export class AiServiceClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.AI_SERVICE_URL,
      timeout: env.AI_TIMEOUT_MS,
      headers: { "Content-Type": "application/json" }
    });
  }

  private async withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= env.AI_MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const status = (error as AxiosError)?.response?.status;
        const retryable = !status || status >= 500 || (error as AxiosError).code === "ECONNABORTED";
        if (!retryable || attempt === env.AI_MAX_RETRIES) break;
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
      }
    }
    const ax = lastError as AxiosError;
    throw new AppError(
      ax.code === "ECONNABORTED" ? 504 : 502,
      `AI service unavailable during ${label}`,
      ax.response?.data || ax.message
    );
  }

  health() {
    return this.withRetry(() => this.http.get("/v1/health").then((r) => r.data), "health");
  }

  parseResume(payload: { resumeText: string; job?: unknown; candidates?: unknown[] }) {
    return this.withRetry(() => this.http.post("/v1/parse-resume", payload).then((r) => r.data), "parse-resume");
  }

  match(payload: { intent?: string; resume?: unknown; job?: unknown; candidates?: unknown[] }) {
    return this.withRetry(() => this.http.post("/v1/match", payload).then((r) => r.data), "match");
  }

  questions(payload: { candidate: unknown; job: unknown }) {
    return this.withRetry(() => this.http.post("/v1/questions", payload).then((r) => r.data), "questions");
  }

  schedule(payload: { command: string; candidates?: unknown[] }) {
    return this.withRetry(() => this.http.post("/v1/schedule", payload).then((r) => r.data), "schedule");
  }

  feedback(payload: { feedbackText: string }) {
    return this.withRetry(() => this.http.post("/v1/feedback", payload).then((r) => r.data), "feedback");
  }

  decision(payload: { feedbackText: string }) {
    return this.withRetry(() => this.http.post("/v1/decision", payload).then((r) => r.data), "decision");
  }

  offer(payload: { candidate: unknown; scheduling?: unknown; job?: unknown }) {
    return this.withRetry(() => this.http.post("/v1/offer", payload).then((r) => r.data), "offer");
  }

  command(payload: { intent: string; job?: unknown; candidates?: unknown[] }) {
    return this.withRetry(() => this.http.post("/v1/command", payload).then((r) => r.data), "command");
  }
}

export const aiServiceClient = new AiServiceClient();
