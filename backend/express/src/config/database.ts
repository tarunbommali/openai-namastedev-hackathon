import mongoose from "mongoose";
import { env } from "./env";

let memoryServer: { stop: () => Promise<boolean> } | null = null;

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  const preferMemory =
    process.env.USE_MEMORY_MONGO === "true" || process.env.USE_MEMORY_MONGO === "1";

  if (!preferMemory) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected:", env.MONGODB_URI);
      return;
    } catch (error) {
      if (env.NODE_ENV === "production") {
        throw error;
      }
      console.warn(
        "MongoDB not reachable at",
        env.MONGODB_URI,
        "— starting in-memory Mongo for local development."
      );
    }
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  memoryServer = mongod;
  const uri = mongod.getUri("hireflow");
  await mongoose.connect(uri);
  console.log("In-memory MongoDB ready:", uri);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
