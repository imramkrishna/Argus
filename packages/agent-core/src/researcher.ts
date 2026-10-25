import { ChatOpenAI } from "@langchain/openai";
import {
  fetchPage,
  searchDocuments,
  webSearch,
} from "./tools/researcher.tools";

const RESEARCHER_PROMPT = `You are an expert technical researcher. Your job is to answer a specific, self-contained research subtask by gathering evidence from web searches and internal architecture documentation.
Rules:
- Be thorough and factual.
- Every claim you make MUST be backed by direct evidence and a source URL or document reference.
- If you cannot verify a claim, list it under 'gaps' rather than guessing.
- Return your output strictly matching the requested structured schema.`;

export function createResearchAgent() {
  const model = new ChatOpenAI({
    modelName: "google/gemini-2.5-flash-lite",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    temperature: 0.1,
  });
  const modelWithTools = model.bindTools([
    webSearch,
    fetchPage,
    searchDocuments,
  ]);
  return {
    model: modelWithTools,
    systemPrompt: RESEARCHER_PROMPT,
    tools: [webSearch, fetchPage, searchDocuments],
  };
}
