import { z } from "zod";

export const AgentRoleSchema = z.enum([
  "planner",
  "researcher",
  "dataAnalyst",
  "critic",
  "synthesizer",
  "supervisor",
  "singleAgent",
  "embeddings",
]);
