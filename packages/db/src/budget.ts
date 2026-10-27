import { eq, sql } from "drizzle-orm";
import { tenantBudgets } from "./schema";
import { withTenant } from "./tenant";

export async function checkTenantBudget(orgId: string) {
  return await withTenant(orgId, async (tx) => {
    const result = await tx
      .select({ remaining: tenantBudgets.remainingUsd })
      .from(tenantBudgets)
      .where(eq(tenantBudgets.orgId, orgId));

    const remaining = result[0]?.remaining ?? 50.0;

    return {
      allowed: remaining > 0,
      remaining,
    };
  });
}

export async function deductTenantBudget(orgId: string, costUsd: number) {
  await withTenant(orgId, async (tx) => {
    await tx
      .update(tenantBudgets)
      .set({
        remainingUsd: sql`${tenantBudgets.remainingUsd} - ${costUsd}`,
        updatedAt: sql`NOW()`,
      })
      .where(eq(tenantBudgets.orgId, orgId));
  });
}

