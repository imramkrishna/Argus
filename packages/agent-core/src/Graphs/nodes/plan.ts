import { createOpenRouterModel } from "../../createModel";
import { RAState, ResearchPlan } from "../types";
const model= createOpenRouterModel()
export const planNode = async (s: typeof RAState.State) => {
  console.log(`\n🗺️ [Router: plan] Decomposing: "${s.question}"`);
  const p = await model
    .withStructuredOutput(ResearchPlan)
    .invoke(
      `Break this question into 2-4 parallel subtasks ('research' for external benchmarks & internal postmortems; 'data' for internal telemetry & costs): ${s.question}`
    );
  console.log(`   -> Planned ${p.subtasks.length} subtasks:`, p.subtasks);
  return { subtasks: p.subtasks };
};