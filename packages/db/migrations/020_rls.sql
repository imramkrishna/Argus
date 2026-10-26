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
