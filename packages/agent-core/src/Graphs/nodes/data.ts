import { dataAnalyst } from "../../agents/dataAnalyst";
import z from "zod";
import { subtaskSchema } from "../types";
export const dataNode = async (input: { task: z.infer<typeof subtaskSchema> }) => {
  console.log(`🚀 [dataNode] Task: "${input.task.task}"`);
  const out = await dataAnalyst.invoke({
    messages: [{ role: "user", content: input.task.task }],
  });
  return { analyses: [out.structuredResponse] };
};