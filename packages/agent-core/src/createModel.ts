import { ChatOpenAI } from "@langchain/openai";

export function createOpenRouterModel(temperature = 0) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY in .env file");
  }
  return new ChatOpenAI({
    model: "google/gemini-2.5-flash-lite",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}