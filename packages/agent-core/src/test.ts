import { singleAgentBaseline } from "./baseline";
import { getMetricsSummary } from "./createModel";
import { renderBaselineReport } from "./Graphs/nodes/renderReport";

const out = await singleAgentBaseline.invoke(
  {
    messages:["Should we migrate our job queue from Redis to Postgres?"]
  },
  {
    maxConcurrency: 2,
  },
);
const summary = getMetricsSummary();
console.log("\n💰 COST & LATENCY BY AGENT:");
console.table(summary.breakdown);
console.log("📈 TOTAL RUN USAGE:", summary.totals);
console.log("\n✅ Baseline Final Report:\n");
console.log(
"\n" + renderBaselineReport(out.structuredResponse),
);


