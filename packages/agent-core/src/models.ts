import { ChatOpenAI } from "@langchain/openai";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { deductTenantBudget, usageLedger, withTenant } from "@repo/db";

export type ModelTier = "fast" | "strong";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface GetModelOptions {
  node: string;
  promptVersion: string;
  feature?: string;
  temperature?: number;
  orgId?: string;
  runId?: string;
}
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "qwen/qwen-2.5-coder-32b-instruct": { input: 0.15, output: 0.2 },
  "qwen/qwen-2.5-72b-instruct": { input: 0.35, output: 0.4 },
  "meta-llama/llama-3.3-70b-instruct": { input: 0.12, output: 0.3 },
};

function createLedgerCallback(modelName: string, opts: GetModelOptions) {
  let startTime = 0;
  return {
    handleLLMStart() {
      startTime = Date.now();
    },
    async handleLLMEnd(output: any) {
      const latencyMs = Date.now() - startTime;
      const usage =
        output?.llmOutput?.tokenUsage ??
        output?.generations?.[0]?.[0]?.message?.usage_metadata ??
        {};

      const inputTokens = usage.promptTokens ?? usage.input_tokens ?? 0;
      const outputTokens = usage.completionTokens ?? usage.output_tokens ?? 0;

      const rates = MODEL_PRICING[modelName] ?? { input: 0.35, output: 0.4 };
      const costUsd =
        (inputTokens / 1_000_000) * rates.input +
        (outputTokens / 1_000_000) * rates.output;
      if (opts.orgId && opts.runId) {
        try {
          await withTenant(opts.orgId, async (tx) => {
            await tx.insert(usageLedger).values({
              orgId: opts.orgId!,
              runId: opts.runId!,
              feature: opts.feature ?? "argus-router",
              node: opts.node,
              model: modelName,
              promptVersion: opts.promptVersion,
              inputTokens,
              outputTokens,
              costUsd,
              latencyMs,
            });
          });

          if (costUsd > 0) {
            await deductTenantBudget(opts.orgId, costUsd);
          }
        } catch (err) {
          console.error(
            `[Ledger Error] Failed to log usage for ${opts.node}:`,
            err,
          );
        }
      }
    },
  };
}
export function getModel(tier: ModelTier, opts: GetModelOptions) {
  if (tier === "fast") {
    const fastPrimaryName = "google/gemini-2.5-flash-lite";
    const fastFallbackName = "qwen/qwen-2.5-coder-32b-instruct";

    const primary = new ChatOpenAI({
      modelName: fastPrimaryName,
      temperature: opts.temperature ?? 0.1,
      maxRetries: 2,
      timeout: 15000,
      configuration: {
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
          "HTTP-Referer": "https://argus.internal",
          "X-Title": "Argus Multi-Agent System",
        },
      },
      modelKwargs: {
        provider: {
          order: ["Google AI Studio", "Google Vertex"],
          allow_fallbacks: false,
        },
      },
      callbacks: [createLedgerCallback(fastPrimaryName, opts)],
    });

    const fallback = new ChatOpenAI({
      modelName: fastFallbackName,
      temperature: opts.temperature ?? 0.1,
      maxRetries: 2,
      timeout: 20000,
      configuration: { baseURL: OPENROUTER_BASE_URL },
      modelKwargs: {
        provider: {
          order: ["Together", "DeepInfra", "Fireworks"],
          allow_fallbacks: true,
        },
      },
      callbacks: [createLedgerCallback(fastFallbackName, opts)],
    });

    return primary.withFallbacks({ fallbacks: [fallback] });
  }

  // Strong Tier
  const strongPrimaryName = "qwen/qwen-2.5-72b-instruct";
  const strongFallbackName = "meta-llama/llama-3.3-70b-instruct";

  const primary = new ChatOpenAI({
    modelName: strongPrimaryName,
    temperature: opts.temperature ?? 0.2,
    maxRetries: 2,
    timeout: 45000,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://argus.internal",
        "X-Title": "Argus Multi-Agent System",
      },
    },
    modelKwargs: {
      provider: {
        order: ["Together", "DeepInfra", "Hyperbolic"],
        allow_fallbacks: false,
      },
    },
    callbacks: [createLedgerCallback(strongPrimaryName, opts)],
  });

  const fallback = new ChatOpenAI({
    modelName: strongFallbackName,
    temperature: opts.temperature ?? 0.2,
    maxRetries: 2,
    timeout: 50000,
    configuration: { baseURL: OPENROUTER_BASE_URL },
    modelKwargs: {
      provider: {
        order: ["Together", "DeepInfra", "Fireworks"],
        allow_fallbacks: true,
      },
    },
    callbacks: [createLedgerCallback(strongFallbackName, opts)],
  });

  return primary.withFallbacks({ fallbacks: [fallback] });
}
