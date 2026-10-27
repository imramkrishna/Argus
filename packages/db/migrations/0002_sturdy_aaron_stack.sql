DROP INDEX "chunks_org_idx";--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "document_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "operational_telemetry" ALTER COLUMN "avg_rps" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "operational_telemetry" ALTER COLUMN "peak_rps" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "operational_telemetry" ALTER COLUMN "cpu_pct" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "usage_ledger" ALTER COLUMN "run_id" SET DATA TYPE text;