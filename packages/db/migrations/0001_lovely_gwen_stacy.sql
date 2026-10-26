CREATE TABLE "tenant_budgets" (
	"org_id" uuid PRIMARY KEY NOT NULL,
	"remaining_usd" double precision DEFAULT 50 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
-- 1. Enable RLS on the new table
ALTER TABLE tenant_budgets ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS (prevents bypass by table owners/migrations on Neon)
ALTER TABLE tenant_budgets FORCE ROW LEVEL SECURITY;

-- 3. Create the isolation policy for all operations (SELECT, UPDATE, INSERT, DELETE)
CREATE POLICY tenant_budgets_isolation_policy ON tenant_budgets
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);