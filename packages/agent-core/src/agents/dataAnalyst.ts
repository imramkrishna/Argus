import { queryDatabase, computeStats } from "../tools/dataAnalyst.tools";
import { createAgent } from "langchain";
import { createOpenRouterModel } from "../createModel";
import z from "zod";
export const Analysis = z.object({
  summary: z
    .string()
    .describe("Executive summary of the operational data analysis"),
  metrics: z
    .array(
      z.object({
        metric: z
          .string()
          .describe("Metric name, e.g., 'peak_rps' or 'monthly_cost_usd'"),
        redisValue: z.string().describe("Observed value for Redis"),
        postgresValue: z.string().describe("Observed value for Postgres"),
        insight: z
          .string()
          .describe("What this comparison means operationally"),
      }),
    )
    .describe("Structured comparison table of operational metrics"),
  gaps: z
    .array(z.string())
    .describe("Missing telemetry or unmeasured operational scenarios"),
});
const ANALYST_PROMPT = `You are a Data Analyst Specialist agent.
Scope: Quantitative analysis of internal production and staging telemetry.
Evidence Rules:
1. Always call queryDatabase first to inspect 'operational_telemetry'.
2. Call computeStats to calculate exact deltas or percentage differences on key metrics (such as p99 latency, peak RPS headroom, or monthly cost).
3. Base every metric row strictly on numbers returned by the database. Put any missing data into 'gaps'.
Stop Condition: Once you have queried the database and computed key comparisons, stop calling tools and produce your structured Analysis response.`;

export const dataAnalyst = createAgent({
  model: createOpenRouterModel(0),
  tools: [queryDatabase, computeStats],
  systemPrompt: ANALYST_PROMPT,
  responseFormat: Analysis,
});
