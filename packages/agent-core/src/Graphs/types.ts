import { StateSchema } from "@langchain/langgraph";
import z from "zod";
export const subtaskSchema = z.object({
  kind: z.enum(["research", "data"]),
  task: z.string(),
});
export const Findings = z.object({
  findings: z.array(
    z.object({
      claim: z.string(),
      evidence: z.string(),
      sourceUrl: z.string(),
    }),
  ),
  gaps: z.array(z.string()),
});
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
export const ResearchPlan = z.object({
  subtasks: z.array(subtaskSchema).min(2).max(4),
});
export const RAState = new StateSchema({
  question: z.string(),
  subtasks: z.array(subtaskSchema),
  findings: z.array(Findings),
  analyses: z.array(Analysis),
  report: z.string(),
});
