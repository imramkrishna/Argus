import {
  fetchPage,
  searchDocuments,
  webSearch,
} from "../tools/researcher.tools";
import { createAgent } from "langchain";
import { createOpenRouterModel } from "../createModel";
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
const RESEARCHER_PROMPT = `You are a technical research specialist.
Mandatory Evidence Rules:
1. For EVERY task, you MUST call BOTH webSearch (for external benchmarks) AND searchDocuments (for internal company RFCs and outage postmortems). Never skip searchDocuments.
2. webSearch only returns teaser snippets. You MUST call fetchPage on the most relevant URL from webSearch to extract exact latency, throughput, and cost numbers.
3. Every claim in your response must cite concrete numbers/facts in 'evidence' and the exact URL or internal doc ID in 'sourceUrl'.
Stop Condition: Only produce your final Findings response after webSearch, searchDocuments, and fetchPage have all been called.`;

export const researcher = createAgent({
  model: createOpenRouterModel(0),
  tools: [webSearch, fetchPage, searchDocuments],
  systemPrompt: RESEARCHER_PROMPT,
  responseFormat: Findings,
});
