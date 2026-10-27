import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { eq, ilike } from "@repo/db";
import { withTenant, documents, chunks, operationalTelemetry } from "@repo/db";
import { getIdentity } from "@repo/shared";

export const searchDocuments = tool(
  async ({ query }, config) => {
    const { orgId } = getIdentity(config);

    const rows = await withTenant(orgId, (tx) =>
      tx
        .select({
          title: documents.title,
          sourceUri: documents.sourceUri,
          content: chunks.content,
        })
        .from(chunks)
        .innerJoin(documents, eq(chunks.documentId, documents.id))
        .where(ilike(chunks.content, `%${query}%`))
        .limit(5),
    );

    return rows.length ? JSON.stringify(rows) : "No documents found.";
  },
  {
    name: "searchDocuments",
    description: "Search internal engineering documents.",
    schema: z.object({ query: z.string() }),
  },
);

export const queryDatabase = tool(
  async ({ service }, config) => {
    const { orgId } = getIdentity(config);

    const rows = await withTenant(orgId, (tx) =>
      service
        ? tx
            .select()
            .from(operationalTelemetry)
            .where(ilike(operationalTelemetry.service, `%${service}%`))
        : tx.select().from(operationalTelemetry),
    );

    return JSON.stringify(rows);
  },
  {
    name: "queryDatabase",
    description: "Query service telemetry metrics.",
    schema: z.object({ service: z.string().optional() }),
  },
);
