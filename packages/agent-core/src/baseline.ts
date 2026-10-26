import { createAgent, toolStrategy, modelCallLimitMiddleware } from "langchain";
import { createOpenRouterModel } from "./createModel.js"; // adjust path if needed
import {
  fetchPage,
  searchDocuments,
  webSearch,
} from "./tools/researcher.tools.js";
import { computeStats, queryDatabase } from "./tools/dataAnalyst.tools.js";
import { ReportSchema } from "./Graphs/types.js";

const BASELINE_PROMPT = `You are a senior engineering analyst with access to both research tools (webSearch, fetchPage, searchDocuments) and operational data tools (queryDatabase, computeStats).
To answer the user's question:
1. Search both external benchmarks (webSearch -> fetchPage) and internal postmortems/RFCs (searchDocuments).
2. Query internal operational telemetry (queryDatabase) and compute key comparisons (computeStats).
3. Produce a final structured Report with a clear recommendation, confidence level, sourced evidence table, and risks.`;

export const singleAgentBaseline = createAgent({
  model: createOpenRouterModel("single-agent"),
  tools: [webSearch, fetchPage, searchDocuments, queryDatabase, computeStats],
  systemPrompt: BASELINE_PROMPT,
  responseFormat: toolStrategy(ReportSchema),
  middleware: [modelCallLimitMiddleware({ runLimit: 15 })],
});
