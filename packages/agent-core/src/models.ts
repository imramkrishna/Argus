import { ChatOpenAI } from "@langchain/openai";
import { Callbacks } from "@langchain/core/callbacks/manager";

export type ModelTier = "fast" | "strong";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface ModelConfig {
  agentName: string;
  promptVersionId: string;
  callbacks?: Callbacks;
  temperature?: number;
}

export function getModel(tier: ModelTier, config: ModelConfig) {
  // --- FAST TIER ---
  const fastPrimary = new ChatOpenAI({
    modelName: "google/gemini-2.5-flash-lite",
    temperature: config.temperature ?? 0.1,
    maxRetries: 2,
    timeout: 15000,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: { "HTTP-Referer": "https://argus.internal" },
    },
    modelKwargs: {
      provider: {
        order: ["Google Vertex", "Google AI Studio"],
        allow_fallbacks: false,
      },
    },
    callbacks: config.callbacks,
  });

  const fastFallback = new ChatOpenAI({
    modelName: "qwen/qwen-2.5-coder-32b-instruct",
    temperature: config.temperature ?? 0.1,
    maxRetries: 2,
    timeout: 20000, 
    configuration: { baseURL: OPENROUTER_BASE_URL },
    modelKwargs: {
      provider: {
        order: ["Together", "DeepInfra", "Fireworks"],
        allow_fallbacks: true,
      },
    },
    callbacks: config.callbacks,
  });

  // --- STRONG TIER ---
  // Strong Primary: Qwen 2.5 72B Instruct (~$0.35/1M)
  const strongPrimary = new ChatOpenAI({
    modelName: "qwen/qwen-2.5-72b-instruct",
    temperature: config.temperature ?? 0.2,
    maxRetries: 2, // Reduced from 3 so it fails over faster
    timeout: 45000,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: { "HTTP-Referer": "https://argus.internal" },
    },
    modelKwargs: {
      provider: {
        order: ["Together", "DeepInfra", "Hyperbolic"],
        allow_fallbacks: false,
      },
    },
    callbacks: config.callbacks,
  });

  // Strong Fallback: Llama 3.3 70B Instruct (~$0.30/1M)
  // Perfectly matches the 70B parameter class capabilities for Critic/Synthesizer roles.
  const strongFallback = new ChatOpenAI({
    modelName: "meta-llama/llama-3.3-70b-instruct",
    temperature: config.temperature ?? 0.2,
    maxRetries: 2,
    timeout: 50000,
    configuration: { baseURL: OPENROUTER_BASE_URL },
    modelKwargs: {
      provider: {
        order: ["Together", "DeepInfra", "Fireworks"],
        allow_fallbacks: true,
      },
    },
    callbacks: config.callbacks,
  });

  if (tier === "strong") {
    const strongModels = strongPrimary.withFallbacks({
      fallbacks: [strongFallback],
    });
    return strongModels;
  }
  const fastModels = fastPrimary.withFallbacks({ fallbacks: [fastFallback] });
  return fastModels;
}
