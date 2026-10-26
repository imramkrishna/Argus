import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { tenantBudgets } from "./schema";
export async function checkTenantBudget(orgId: string) {
  const result = await db
    .select({ remaining: tenantBudgets.remainingUsd })
    .from(tenantBudgets)
    .where(eq(tenantBudgets.orgId, orgId));
  const remaining = result[0]?.remaining ?? 50.0;

  return {
    allowed: remaining > 0,
    remaining,
  };
}

export async function deductTenantBudget(orgId: string, costUsd:number) {
  await db
    .update(tenantBudgets)
    .set({
      remainingUsd: sql`${tenantBudgets.remainingUsd} - ${costUsd}`,
    })
    .where(eq(tenantBudgets.orgId, orgId));
}
