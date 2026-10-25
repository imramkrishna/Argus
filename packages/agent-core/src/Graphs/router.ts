import { StateGraph } from "@langchain/langgraph";
import { RAState } from "./types";

export const routerGraph=new StateGraph(RAState)
