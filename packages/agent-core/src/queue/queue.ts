import { Queue } from "bullmq";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export const graphRunQueue = new Queue("graph-runs", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600, count: 1000 }, // Keep recent jobs for debugging
    removeOnFail: false,
  },
});
