import { ChatOpenAI } from "@langchain/openai";
export interface AgentMetric {
  agent: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
}
const INPUT_COST_PER_1M = 0.1;
const OUTPUT_COST_PER_1M = 0.4;

const metricsByAgent = new Map<string, AgentMetric>();
export function resetMetric() {
  metricsByAgent.clear();
}
export function getMetricsSummary() {
  const breakdown = Array.from(metricsByAgent.values());
  const totals = breakdown.reduce(
    (acc, m) => ({
      calls: acc.calls + m.calls,
      inputTokens: acc.inputTokens + m.inputTokens,
      outputTokens: acc.outputTokens + m.outputTokens,
      totalTokens: acc.totalTokens + m.totalTokens,
      costUsd: Number((acc.costUsd + m.costUsd).toFixed(6)),
    }),
    { calls: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
  );
  return { breakdown, totals };
}
export function createOpenRouterModel(agentName: string, temperature = 0) {
  const startTimes = new Map<string, number>();
  return new ChatOpenAI({
    model: "google/gemini-2.5-flash-lite",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature,
    maxRetries: 6, // Retries with exponential backoff on 429
    timeout: 60000,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://argus.local",
        "X-Title": "Argus Multi-Agent System",
      },
    },
    callbacks: [
      {
        handleLLMStart(_llm, _prompts, runId) {
          startTimes.set(runId, Date.now());
        },
        handleLLMEnd(output, runId) {
          const elapsed = Date.now() - (startTimes.get(runId) ?? Date.now());
          startTimes.delete(runId);
          const usage = output.llmOutput?.tokenUsage;
          const inputTokens = usage.promptTokens ?? usage.input_tokens ?? 0;
          const outputTokens =
            usage.completionTokens ?? usage.output_tokens ?? 0;
          const totalTokens =
            usage.totalTokens ??
            usage.total_tokens ??
            inputTokens + outputTokens;

          const callCost =
            (inputTokens / 1_000_000) * INPUT_COST_PER_1M +
            (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M;

          const current = metricsByAgent.get(agentName) ?? {
            agent: agentName,
            calls: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costUsd: 0,
            latencyMs: 0,
          };

          current.calls += 1;
          current.inputTokens += inputTokens;
          current.outputTokens += outputTokens;
          current.totalTokens += totalTokens;
          current.costUsd = Number((current.costUsd + callCost).toFixed(6));
          current.latencyMs += elapsed;

          metricsByAgent.set(agentName, current);
        },
      },
    ],
    modelKwargs: {
      provider: {
        // Skip "Google AI Studio" shared pool; use Google Vertex
        order: ["Google Vertex"],
        allow_fallbacks: true,
      },
    },
  });
}
