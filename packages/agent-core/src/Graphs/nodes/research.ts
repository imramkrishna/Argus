import { subtaskSchema } from "../types";
import z from "zod";
import { researcher } from "../../agents/researcher";
export const researchNode = async (input: { task: z.infer<typeof subtaskSchema> }) => {
  console.log(`🚀 [researchNode] Task: "${input.task.task}"`);
  const out = await researcher.invoke({
    messages: [{ role: "user", content: input.task.task }],
  });
  return { findings: out.structuredResponse.findings };
};