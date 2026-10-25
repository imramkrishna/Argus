import { createOpenRouterModel } from "../../createModel";
import { RAState, ReportSchema } from "../types";
const model = createOpenRouterModel();
export const synthesize = async (s: typeof RAState.State) => {
  console.log(
    `\n📝 [synthesize] Generating structured Report from ${s.findings.length} findings & ${s.analyses.length} analyses...`
  );
  const report = await model.withStructuredOutput(ReportSchema).invoke(
    `Synthesize a final engineering decision report for: "${s.question}"
Every claim in 'evidence' must link to a concrete URL, doc ID, or database metric.
Assign 'confidence' (low/medium/high) based on evidence coverage and any remaining gaps.

Findings: ${JSON.stringify(s.findings)}
Analyses: ${JSON.stringify(s.analyses)}
Last Critique: ${JSON.stringify(s.critique)}`
  );
  return { report };
};



