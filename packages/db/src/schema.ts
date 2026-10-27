import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  doublePrecision,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Documents Table
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  orgId: uuid("org_id").notNull(),
  title: text("title").notNull(),
  sourceUri: text("source_uri").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Chunks Table (Dual-indexed: HNSW for Vector + GIN for Full-Text Search)
export const chunks = pgTable(
  "chunks",
  {
    id: text("id").primaryKey(),
    orgId: uuid("org_id").notNull(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("chunks_embedding_hnsw_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    index("chunks_content_gin_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.content})`
    ),
  ]
);

// 3. Runs Table (Tracks LangGraph executions & stores final JSON report)
export const runs = pgTable("runs", {
  id: text("id").primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: text("user_id").notNull(),
  threadId: text("thread_id").notNull(),
  question: text("question").notNull(),
  status: text("status").default("pending").notNull(), // "pending" | "running" | "completed" | "failed"
  report: jsonb("report"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Usage Ledger Table (Granular token & cost telemetry per node call)
export const usageLedger = pgTable("usage_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  runId: text("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  node: text("node").notNull(),
  model: text("model").notNull(),
  promptVersion: text("prompt_version").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: doublePrecision("cost_usd").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Operational Telemetry Table (Queried by the Data Analyst agent)
export const operationalTelemetry = pgTable("operational_telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  service: text("service").notNull(),
  avgRps: doublePrecision("avg_rps").notNull(),
  peakRps: doublePrecision("peak_rps").notNull(),
  p99Ms: doublePrecision("p99_ms").notNull(),
  cpuPct: doublePrecision("cpu_pct").notNull(),
  monthlyCostUsd: doublePrecision("monthly_cost_usd").notNull(),
  incidents90d: integer("incidents_90d").notNull(),
});

// 6. Tenant Budgets Table (Prepaid wallet balance per organization)
export const tenantBudgets = pgTable("tenant_budgets", {
  orgId: uuid("org_id").primaryKey(),
  remainingUsd: doublePrecision("remaining_usd").default(50.0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
