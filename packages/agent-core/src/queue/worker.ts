import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { routerGraph } from "../Graphs/router";
import { getMetricsSummary, resetMetric } from "../createModel";
import {
  checkTenantBudget,
  deductTenantBudget,
  runs,
  withTenant,
} from "@repo/db";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const graphWorker = new Worker(
  "graph-runs",
  async (job: Job) => {
    const { orgId, userId, role, threadId, runId, question } = job.data;

    // 1. Pre-flight Wallet Check (must run inside withTenant because of RLS!)
    const { allowed, remaining } = await withTenant(orgId, () =>
      checkTenantBudget(orgId),
    );

    if (!allowed) {
      throw new Error(
        `402 Payment Required: Budget exhausted ($${remaining.toFixed(4)} remaining).`,
      );
    }

    // 2. Reset in-memory metrics before the run starts
    resetMetric();

    // 3. Invoke the existing LangGraph router directly
    const finalState = await routerGraph.invoke(
      { question },
      {
        maxConcurrency: 2,
        configurable: { orgId, userId, role, threadId, runId },
      },
    );

    // 4. Extract calculated cost from your existing createModel.ts tracker
    const metrics = getMetricsSummary();
    const totalCostUsd = metrics.totals.costUsd ?? 0;

    // 5. Save the final report to the `runs` table and deduct the wallet inside RLS
    await withTenant(orgId, async (tx) => {
      await tx.update(runs).set({
        status: "completed",
        report: finalState.report,
      });

      if (totalCostUsd > 0) {
        await deductTenantBudget(orgId, totalCostUsd);
      }
    });

    return finalState.report;
  },
  {
    connection: redis,
    concurrency: 2, // Kept low so in-memory metrics don't collide across concurrent jobs
  },
);

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Draining BullMQ worker...");
  await graphWorker.close();
  await redis.quit();
  process.exit(0);
});
