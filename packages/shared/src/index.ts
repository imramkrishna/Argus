import z from "zod";

export const runIdentitySchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  role: z.enum(["viewer", "analyst", "admin"]).default("analyst"),
  threadId: z.string(),
  runId: z.string(),
});

export type RunIdentity = z.infer<typeof runIdentitySchema>;

export function getIdentity(config?: { configurable?: unknown }): RunIdentity {
  return runIdentitySchema.parse(config);
}
