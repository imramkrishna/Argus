import { ChatOpenAI } from "@langchain/openai";
import { queryDatabase,computeStats } from "../tools/dataAnalyst.tools";

const DATA_ANALYST_PROMPT = `You are an expert database and systems data analyst. Your job is to analyze internal operational telemetry and performance tables to answer quantitative engineering questions.
Rules:
- Query the operational database using safe read-only SQL queries.
- Extract precise metrics, latencies, throughput numbers, and cost figures.
- Summarize findings clearly into structured metric rows with contextual baselines.
- If data is missing or a table is unpopulated, note it clearly under 'gaps'.
- Return your output strictly matching the requested structured schema.`;

export function createDataAnalystAgent() {
  const model = new ChatOpenAI({
    modelName: "google/gemini-2.5-flash-lite",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    temperature: 0.1,
  });

  const modelWithTools = model.bindTools([queryDatabase,computeStats]);

  return {
    model: modelWithTools,
    systemPrompt: DATA_ANALYST_PROMPT,
    tools: [queryDatabase,computeStats],
  };
}
