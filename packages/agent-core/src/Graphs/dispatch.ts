import { Send } from "@langchain/langgraph";
import { RAState } from "./types";

export const dispatch = (s: typeof RAState.State) => {
  return s.subtasks.map((subtask) => {
    return new Send(subtask.kind === "research" ? "researchNode" : "dataNode", {
      task: subtask,
    });
  });
};
