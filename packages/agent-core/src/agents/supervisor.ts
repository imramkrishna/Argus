import { tool } from "@langchain/core/tools";
import { researcher } from "./researcher";
import { dataAnalyst } from "./dataAnalyst";
import z from "zod";
import { createAgent, modelCallLimitMiddleware } from "langchain";
import { createOpenRouterModel } from "../createModel";
export const delegateResearch = tool(
  async ({ task }, config) => {
    console.log(`\n🧭 [Supervisor -> Researcher] Delegating: "${task}"`);
    const out = await researcher.invoke(
      {
        messages: [{ role: "human", content: task }],
      },
      { context: config?.context },
    );
    return JSON.stringify(out.structuredResponse);
  },
  {
    name: "delegate_research",
    description:
      "Give a focused research task to the research specialist. Use for external facts, benchmarks, and internal RFC docs.",
    schema: z.object({
      task: z.string().describe("A specific, self-contained research question"),
    }),
  },
);

export const delegateAnalysis = tool(
  async ({ task }, config) => {
    console.log(`\n🧭 [Supervisor -> DataAnalyst] Delegating: "${task}"`);
    const out = await dataAnalyst.invoke(
      { messages: [{ role: "user", content: task }] },
      { context: config?.context },
    );
    return JSON.stringify(out.structuredResponse);
  },
  {
    name: "delegate_analysis",
    description:
      "Give a focused quantitative analysis task to the data analyst specialist. Use for internal operational telemetry, RPS, latency, CPU, and costs.",
    schema: z.object({
      task: z
        .string()
        .describe("A specific, self-contained data analysis question"),
    }),
  },
);

const SUPERVISOR_PROMPT = `You are a technical engineering supervisor.
To answer the user's architectural question:
1. Decompose the problem into external research and internal operational data analysis.
2. Delegate focused, self-contained tasks using delegate_research and delegate_analysis.
3. Check coverage of the returned findings and metrics. If critical gaps prevent a high-confidence recommendation, delegate a targeted follow-up.
4. Synthesize a clear final recommendation backed by both external evidence URLs and internal telemetry numbers.`;
const model = createOpenRouterModel("supervisor");
export const supervisor = createAgent({
  model,
  tools: [delegateResearch, delegateAnalysis],
  systemPrompt: SUPERVISOR_PROMPT,
  middleware: [modelCallLimitMiddleware({ runLimit: 12 })],
});
