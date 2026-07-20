import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import { env } from "./config/env";
import { seedDatabase } from "./utils/seed";

async function main() {
  await connectDatabase();
  await connectRedis();
  if (env.SEED_ON_BOOT) {
    await seedDatabase();
  }
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`HireFlow Express BFF on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Express:", err);
  process.exit(1);
});
