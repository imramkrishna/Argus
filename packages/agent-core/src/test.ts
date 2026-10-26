import { getMetricsSummary } from "./createModel";
import { renderReport } from "./Graphs/nodes/renderReport";
import { routerGraph } from "./Graphs/router";
const out = await routerGraph.invoke(
  {
    question: "Should we migrate our job queue from Redis to Postgres?",
  },
  {
    maxConcurrency: 2,
  },
);
const summary = getMetricsSummary();
console.log("\n💰 COST & LATENCY BY AGENT:");
console.table(summary.breakdown);
console.log("📈 TOTAL RUN USAGE:", summary.totals);
console.log("\n✅ Router Final Report:\n");
if (out.report) {
  console.log("\n" + renderReport(out.report));
}



