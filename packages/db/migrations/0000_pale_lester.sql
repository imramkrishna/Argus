CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"title" text NOT NULL,
	"source_uri" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operational_telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"service" text NOT NULL,
	"avg_rps" integer NOT NULL,
	"peak_rps" integer NOT NULL,
	"p99_ms" double precision NOT NULL,
	"cpu_pct" integer NOT NULL,
	"monthly_cost_usd" double precision NOT NULL,
	"incidents_90d" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"question" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"report" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"node" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cost_usd" double precision NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunks_org_idx" ON "chunks" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "chunks_embedding_hnsw_idx" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "chunks_content_gin_idx" ON "chunks" USING gin (to_tsvector('english', "content"));


-- Enable Row Level Security on all multi-tenant tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_telemetry ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy using session-local configuration variable
CREATE POLICY tenant_isolation_documents ON documents
    USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation_chunks ON chunks
    USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation_runs ON runs
    USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation_ledger ON usage_ledger
    USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation_telemetry ON operational_telemetry
    USING (org_id = current_setting('app.org_id', true)::uuid);