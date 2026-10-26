import { renderReport } from "../Graphs/nodes/renderReport";
import { routerGraph } from "../Graphs/router";
const out = await routerGraph.invoke(
  {
    question: "Should we migrate our job queue from Redis to Postgres?",
  },
  {
    maxConcurrency: 2,
  },
);

console.log("\n✅ Router Final Report:\n");
if (out.report) {
  console.log("\n" + renderReport(out.report));
}

