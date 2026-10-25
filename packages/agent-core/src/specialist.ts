import { createOpenRouterModel } from "./createModel";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  fetchPage,
  searchDocuments,
  webSearch,
} from "./tools/researcher.tools";
import { computeStats, queryDatabase } from "./tools/dataAnalyst.tools";
import z from "zod";

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

/**
 * 3. SPECIALIST PROMPTS (Narrow job, scope, evidence rules, stop conditions)
 */
const RESEARCHER_PROMPT = `You are a technical research specialist.
Mandatory Evidence Rules:
1. For EVERY task, you MUST call BOTH webSearch (for external benchmarks) AND searchDocuments (for internal company RFCs and outage postmortems). Never skip searchDocuments.
2. webSearch only returns teaser snippets. You MUST call fetchPage on the most relevant URL from webSearch to extract exact latency, throughput, and cost numbers.
3. Every claim in your response must cite concrete numbers/facts in 'evidence' and the exact URL or internal doc ID in 'sourceUrl'.
Stop Condition: Only produce your final Findings response after webSearch, searchDocuments, and fetchPage have all been called.`;

const ANALYST_PROMPT = `You are a Data Analyst Specialist agent.
Scope: Quantitative analysis of internal production and staging telemetry.
Evidence Rules:
1. Always call queryDatabase first to inspect 'operational_telemetry'.
2. Call computeStats to calculate exact deltas or percentage differences on key metrics (such as p99 latency, peak RPS headroom, or monthly cost).
3. Base every metric row strictly on numbers returned by the database. Put any missing data into 'gaps'.
Stop Condition: Once you have queried the database and computed key comparisons, stop calling tools and produce your structured Analysis response.`;

/**
 * 4. SPECIALIST AGENTS (Section 13.4)
 * Each specialist is independently testable and returns `out.structuredResponse`.
 */
export const researcher = createReactAgent({
  llm: createOpenRouterModel(0),
  tools: [webSearch, fetchPage, searchDocuments],
  prompt: RESEARCHER_PROMPT,
  responseFormat: Findings,
});

export const dataAnalyst = createReactAgent({
  llm: createOpenRouterModel(0),
  tools: [queryDatabase, computeStats],
  prompt: ANALYST_PROMPT,
  responseFormat: Analysis,
});
