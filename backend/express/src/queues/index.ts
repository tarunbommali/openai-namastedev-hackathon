/**
 * BullMQ wiring for future async AI jobs.
 * Frontend-compatible /api/command remains synchronous for now.
 */
import { Queue } from "bullmq";
import { env } from "../config/env";

let commandQueue: Queue | null = null;

export function getCommandQueue(): Queue {
  if (!commandQueue) {
    commandQueue = new Queue("hireflow-ai-commands", {
      connection: { url: env.REDIS_URL }
    });
  }
  return commandQueue;
}
