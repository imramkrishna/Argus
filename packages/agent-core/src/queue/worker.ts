import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { runArgusGraph } from "./runner";
import { checkTenantBudget, deductTenantBudget } from "@argus/db/budget";

const redis = new Redis(process.env.REDIS_URL!);

export const graphWorker = new Worker(
  "graph-runs",
  async (job: Job) => {
    const { orgId, threadId, question } = job.data;

    // 1. Pre-flight Wallet Check
    const { allowed } = await checkTenantBudget(orgId);
    if (!allowed) {
      throw new Error("402 Payment Required: Organization budget exceeded.");
    }

    // 2. Execute Graph
    // runArgusGraph should return the final state and the total calculated cost
    const { report, costUsd } = await runArgusGraph(
      { question },
      { configurable: { orgId, threadId, runId: job.id } }
    );

    // 3. Deduct Wallet
    if (costUsd > 0) {
      await deductTenantBudget(orgId, costUsd);
    }

    return report;
  },
  {
    connection: redis,
    concurrency: 10, // Adjust based on your Neon DB connection pool limits
  }
);

// Graceful draining for CI/CD deployments to prevent dropped jobs
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Draining BullMQ worker...");
  await graphWorker.close();
  await redis.quit();
  process.exit(0);
});
