import Redis from "ioredis";
import { env } from "./env";

let redis: Redis | null = null;
let redisEnabled = false;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null // do not reconnect forever when Redis is down
    });
    redis.on("error", () => {
      /* silenced — optional dependency for refresh denylist */
    });
  }
  return redis;
}

export function isRedisReady() {
  return redisEnabled;
}

export async function connectRedis(): Promise<void> {
  try {
    const client = getRedis();
    if (client.status === "wait") await client.connect();
    await client.ping();
    redisEnabled = true;
    console.log("Redis connected");
  } catch (error) {
    redisEnabled = false;
    console.warn("Redis unavailable — refresh revoke denylist disabled");
    try {
      await redis?.quit();
    } catch {
      /* ignore */
    }
    redis = null;
  }
}
