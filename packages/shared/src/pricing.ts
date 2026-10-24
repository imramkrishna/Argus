import { z } from "zod";

export const AgentRoleSchema = z.enum([
  "planner",
  "researcher",
  "dataAnalyst",
  "critic",
  "synthesizer",
  "supervisor",
  "singleAgent",
  "embeddings",
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const ArchitectureModeSchema = z.enum(["single", "router", "supervisor"]);
export type ArchitectureMode = z.infer<typeof ArchitectureModeSchema>;

export const MODEL_PRICING_PER_1M: Record<
  string,
  { inputUsdPer1M: number; outputUsdPer1M: number }
> = {
  "google/gemini-2.5-flash-lite": {
    inputUsdPer1M: 0.10,
    outputUsdPer1M: 0.40,
  },
  "text-embedding-3-small": {
    inputUsdPer1M: 0.02,
    outputUsdPer1M: 0.0,
  },
};

export interface AgentCallMetric {
  id: string;
  agent: AgentRole;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  timestamp: string;
}

export interface AgentSummaryMetric {
  agent: AgentRole;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  totalLatencyMs: number;
}

export interface RunTelemetrySummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  wallClockLatencyMs: number;
  byAgent: Record<string, AgentSummaryMetric>;
}

export function calculateCallCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  providerReportedCostUsd?: number
): number {
  if (typeof providerReportedCostUsd === "number" && providerReportedCostUsd > 0) {
    return providerReportedCostUsd;
  }

  const pricing = MODEL_PRICING_PER_1M[model] ?? {
    inputUsdPer1M: 0.10,
    outputUsdPer1M: 0.40,
  };

  const inputCost = (inputTokens / 1_000_000) * pricing.inputUsdPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputUsdPer1M;
  return Number((inputCost + outputCost).toFixed(8));
}

export function summarizeRunTelemetry(
  metrics: AgentCallMetric[],
  wallClockLatencyMs: number
): RunTelemetrySummary {
  const byAgent: Record<string, AgentSummaryMetric> = {};

  let totalCalls = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalCostUsd = 0;

  for (const m of metrics) {
    totalCalls += 1;
    totalInputTokens += m.inputTokens;
    totalOutputTokens += m.outputTokens;
    totalTokens += m.totalTokens;
    totalCostUsd += m.costUsd;

    const existing = byAgent[m.agent] ?? {
      agent: m.agent,
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      totalLatencyMs: 0,
    };

    existing.calls += 1;
    existing.inputTokens += m.inputTokens;
    existing.outputTokens += m.outputTokens;
    existing.totalTokens += m.totalTokens;
    existing.costUsd = Number((existing.costUsd + m.costUsd).toFixed(8));
    existing.totalLatencyMs += m.latencyMs;

    byAgent[m.agent] = existing;
  }

  return {
    totalCalls,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCostUsd: Number(totalCostUsd.toFixed(8)),
    wallClockLatencyMs,
    byAgent,
  };
}

