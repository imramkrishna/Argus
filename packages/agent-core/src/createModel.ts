import { ChatOpenAI } from "@langchain/openai";

export function createOpenRouterModel(temperature = 0) {
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
    modelKwargs: {
      provider: {
        // Skip "Google AI Studio" shared pool; use Google Vertex
        order: ["Google Vertex"],
        allow_fallbacks: true,
      },
    },
  });
}
