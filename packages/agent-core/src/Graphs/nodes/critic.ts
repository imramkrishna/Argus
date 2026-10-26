import z from "zod";
import { Send } from "@langchain/langgraph";
import { Critique, RAState } from "../types";
import { createOpenRouterModel } from "../../createModel";
const model = createOpenRouterModel("critic");

const CRITIC_PROMPT = `You are a rigorous technical Critic. Audit the collected Research Findings and Data Analyses against the user's question:
1. Comparison Completeness: If the question compares options (e.g., System A vs System B), did we gather metrics and research for BOTH options, or only one?
2. Contradictions: Do the research findings and data analyses contradict each other on costs, latency, or throughput?
3. Evidence Quality: Does every claim cite a concrete sourceUrl or database metric?
4. Unresolved Gaps: Did the specialists report critical 'gaps' that can be answered by a targeted follow-up query?

If evidence is complete and consistent, set verdict="sufficient" and gaps=[].
Otherwise, set verdict="gaps" and write up to 3 specific followUpTasks assigned to 'research' or 'data'.`;

export async function runCritic(input: {
  question: string;
  findings: unknown[];
  analyses: unknown[];
}) {
  return model.withStructuredOutput(Critique).invoke([
    { role: "system", content: CRITIC_PROMPT },
    {
      role: "user",
      content: `Question: ${input.question}\nFindings: ${JSON.stringify(input.findings)}\nAnalyses: ${JSON.stringify(input.analyses)}`,
    },
  ]);
}

export const critic = async (s: typeof RAState.State) => {
  const round = s.criticRounds + 1;
  console.log(
    `\n🧐 [critic] Round ${round} evaluating ${s.findings.length} findings & ${s.analyses.length} analyses...`,
  );
  const critique = await runCritic({
    question: s.question,
    findings: s.findings,
    analyses: s.analyses,
  });
  console.log(
    `   -> Verdict: "${critique.verdict}" (${critique.gaps.length} gaps found)`,
  );
  for (const g of critique.gaps) {
    console.log(
      `      ⚠️ Gap [${g.kind}]: ${g.issue} -> Follow-up: "${g.followUpTask}"`,
    );
  }
  return { critique, criticRounds: s.criticRounds+1 };
};

export const afterCritic = (s: typeof RAState.State) => {
  if (
    s.critique?.verdict === "sufficient" ||
    s.criticRounds >= 2 ||
    !s.critique?.gaps.length
  ) {
    return "synthesize";
  }
  console.log(
    `\n🔄 [afterCritic] Fanning out ${s.critique.gaps.length} follow-up tasks (Round ${s.criticRounds})...`,
  );
  return s.critique.gaps.map(
    (g) =>
      new Send(g.kind === "data" ? "dataNode" : "researchNode", {
        task: { kind: g.kind, task: g.followUpTask },
      }),
  );
};
