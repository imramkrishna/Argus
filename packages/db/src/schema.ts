import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";

// 1. Documents (Internal RFCs / Postmortems)
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  title: text("title").notNull(),
  sourceUri: text("source_uri").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").notNull(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    // 1. B-Tree index for fast tenant isolation filtering
    index("chunks_org_idx").on(table.orgId),

    // 2. HNSW index for fast Semantic (Vector) Search
    index("chunks_embedding_hnsw_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),

    // 3. GIN expression index for fast Full-Text (Keyword) Search
    index("chunks_content_gin_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.content})`,
    ),
  ],
);

// 3. Runs (Tracks graph executions & verifies thread ownership - Section 14.3)
export const runs = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  userId: text("user_id").notNull(),
  threadId: text("thread_id").notNull(),
  question: text("question").notNull(),
  status: text("status").default("queued").notNull(), // queued | running | completed | failed
  report: jsonb("report"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Usage Ledger (Every model call recorded - Section 14.19)
export const usageLedger = pgTable("usage_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(), // e.g. "argus-router"
  node: text("node").notNull(), // e.g. "planner", "researcher", "critic"
  model: text("model").notNull(),
  promptVersion: text("prompt_version").notNull(), // e.g. "critic@2026-10-26"
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: doublePrecision("cost_usd").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const tenantBudgets = pgTable("tenant_budgets", {
  orgId: uuid("org_id").primaryKey(), // One row per tenant
  remainingUsd: doublePrecision("remaining_usd").default(50.0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Operational Telemetry (For DataAnalyst queryDatabase tool)
export const operationalTelemetry = pgTable("operational_telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  service: text("service").notNull(),
  avgRps: integer("avg_rps").notNull(),
  peakRps: integer("peak_rps").notNull(),
  p99Ms: doublePrecision("p99_ms").notNull(),
  cpuPct: integer("cpu_pct").notNull(),
  monthlyCostUsd: doublePrecision("monthly_cost_usd").notNull(),
  incidents90d: integer("incidents_90d").notNull(),
});
