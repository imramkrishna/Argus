import { RAState, ResearchPlan } from "../types";
import { createOpenRouterModel } from "../../createModel";
const model = createOpenRouterModel("planner");
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