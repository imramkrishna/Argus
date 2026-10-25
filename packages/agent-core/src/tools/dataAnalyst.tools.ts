import { tool } from "@langchain/core/tools";
import z from "zod";

const DUMMY_TELEMETRY_ROWS = [
  {
    service: "redis-bullmq-prod",
    avg_rps: 3200,
    peak_rps: 8900,
    p50_latency_ms: 0.9,
    p99_latency_ms: 2.4,
    error_rate_pct: 0.12,
    cpu_utilization_pct: 42,
    monthly_cost_usd: 1450,
    incidents_last_90d: 2,
  },
  {
    service: "postgres-primary-db",
    avg_rps: 4100,
    peak_rps: 9500,
    p50_latency_ms: 3.1,
    p99_latency_ms: 11.8,
    error_rate_pct: 0.01,
    cpu_utilization_pct: 38,
    monthly_cost_usd: 2200,
    incidents_last_90d: 0,
  },
  {
    service: "postgres-queue-staging-poc",
    avg_rps: 3500,
    peak_rps: 9200,
    p50_latency_ms: 4.5,
    p99_latency_ms: 14.6,
    error_rate_pct: 0.0,
    cpu_utilization_pct: 54,
    monthly_cost_usd: 0, // runs on existing Postgres instance
    incidents_last_90d: 0,
  },
];

export const queryDatabase = tool(
  async ({ sqlQuery }) => {
    console.log(`  🗄️ [DataAnalyst Tool: queryDatabase] sql="${sqlQuery}"`);
    // Dummy implementation: returns our simulated operational telemetry rows
    return JSON.stringify({
      executedQuery: sqlQuery,
      rowCount: DUMMY_TELEMETRY_ROWS.length,
      rows: DUMMY_TELEMETRY_ROWS,
      schemaNote:
        "Table: operational_telemetry (service, avg_rps, peak_rps, p50_latency_ms, p99_latency_ms, error_rate_pct, cpu_utilization_pct, monthly_cost_usd, incidents_last_90d)",
    });
  },
  {
    name: "queryDatabase",
    description:
      "Execute a read-only SQL query against the internal operational_telemetry database to inspect throughput, latency, CPU headroom, errors, and cost.",
    schema: z.object({
      sqlQuery: z.string().describe("SQL SELECT query to run on operational_telemetry"),
    }),
  }
);

export const computeStats = tool(
  async ({ metricName, values }) => {
    console.log(
      `  📊 [DataAnalyst Tool: computeStats] metric="${metricName}" values=[${values.join(", ")}]`
    );
    if (values.length === 0) {
      return JSON.stringify({ error: "No values provided" });
    }
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0]!;
    const max = sorted[sorted.length - 1]!;
    const diffPct = min !== 0 ? ((max - min) / min) * 100 : 0;

    return JSON.stringify({
      metricName,
      count: values.length,
      mean: Number(mean.toFixed(2)),
      min,
      max,
      delta: Number((max - min).toFixed(2)),
      relativeDifferencePct: `${diffPct.toFixed(1)}%`,
    });
  },
  {
    name: "computeStats",
    description:
      "Compute statistical summaries (mean, min, max, delta, relative percentage difference) over an array of numeric metrics.",
    schema: z.object({
      metricName: z.string().describe("Label for the calculation, e.g. 'p99_latency_comparison'"),
      values: z.array(z.number()).describe("Array of numbers to analyze"),
    }),
  }
);