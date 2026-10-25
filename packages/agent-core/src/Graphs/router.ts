import { END, START, StateGraph } from "@langchain/langgraph";
import { RAState } from "./types";
import { planNode } from "./nodes/plan";
import { researchNode } from "./nodes/research";
import { dataNode } from "./nodes/data";
import { synthesize } from "./nodes/synthesize";
import { dispatch } from "./dispatch";
import { afterCritic, critic } from "./nodes/critic";

export const routerGraph = new StateGraph(RAState)
  .addNode("plan", planNode)
  .addNode("researchNode", researchNode)
  .addNode("dataNode", dataNode)
  .addNode("critic", critic)
  .addNode("synthesize", synthesize)
  .addEdge(START, "plan")
  .addConditionalEdges("plan", dispatch, ["researchNode", "dataNode"])
  .addEdge("researchNode", "critic")
  .addEdge("dataNode", "critic")
  .addConditionalEdges("critic", afterCritic, ["researchNode", "dataNode", "synthesize"])
  .addEdge("synthesize", END)
  .compile();

