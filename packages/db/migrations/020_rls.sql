-- Enable and Force RLS on all 6 tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks FORCE ROW LEVEL SECURITY;

ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs FORCE ROW LEVEL SECURITY;

ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger FORCE ROW LEVEL SECURITY;

ALTER TABLE operational_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_telemetry FORCE ROW LEVEL SECURITY;

ALTER TABLE tenant_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_budgets FORCE ROW LEVEL SECURITY;

-- Isolation Policies
CREATE POLICY documents_isolation ON documents
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY chunks_isolation ON chunks
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY runs_isolation ON runs
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY usage_ledger_isolation ON usage_ledger
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY operational_telemetry_isolation ON operational_telemetry
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_budgets_isolation ON tenant_budgets
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);
