import { db } from "./client.js";
import { sql } from "drizzle-orm";

/**
 * Executes a database operation within a transaction-local tenant context.
 * Enforces PostgreSQL Row-Level Security (RLS)[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span).
 */
export async function withTenant<T>(
  orgId: string,
  fn: (tx: any) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // 1. Tell Postgres who the current organization is for this transaction
    await tx.execute(sql`SELECT set_config('app.org_id', ${orgId}, true)`);

    // 2. Run your database queries safely inside this locked context
    return fn(tx);
  });
}
