import { tool } from "@langchain/core/tools";
import z from "zod";

export const webSearch = tool(
  async ({ query }) => {
    console.log(`  🔍 [Researcher Tool: webSearch] query="${query}"`);
    return JSON.stringify({
      query,
      results: [
        {
          title:
            "Postgres SKIP LOCKED vs Redis BullMQ: 2026 Production Benchmarks",
          url: "https://engineering.example.com/postgres-skip-locked-benchmarks",
          snippet:
            "PostgreSQL 17+ using SELECT ... FOR UPDATE SKIP LOCKED sustains 14,500 jobs/sec with transactional ACID guarantees. Redis BullMQ achieves 48,000 jobs/sec at sub-2ms latency but risks job loss on unpersisted failover.",
        },
        {
          title: "When Not to Use Postgres as a Job Queue",
          url: "https://highscalability.example.com/postgres-queue-pitfalls",
          snippet:
            "At high churn (>20,000 updates/sec), Postgres MVCC table bloat and autovacuum contention can degrade primary database read queries by 35% unless queues are isolated on a separate instance or partitioned.",
        },
      ],
    });
  },
  {
    name: "webSearch",
    description:
      "Search the web for external benchmarks, architecture articles, and documentation.",
    schema: z.object({
      query: z.string().describe("Focused technical search query"),
    }),
  },
);

export const fetchPage = tool(
  async ({ url }) => {
    console.log(`  📄 [Researcher Tool: fetchPage] url="${url}"`);
    return JSON.stringify({
      url,
      content: `Full technical breakdown from ${url}:
1. Durability: Postgres queues commit job state in the same transaction as business data (zero dual-write bugs).
2. Latency: Redis p99 enqueue/dequeue is 1.8ms; Postgres SKIP LOCKED p99 is 14.2ms under 10k RPS.
3. Operational overhead: Eliminating a dedicated Redis cluster saves $1,400/month in managed cloud costs, provided existing Postgres CPU utilization has >30% headroom.`,
    });
  },
  {
    name: "fetchPage",
    description:
      "Fetch the full text content of a specific URL returned by webSearch.",
    schema: z.object({
      url: z.string().describe("The URL to read in full"),
    }),
  },
);

export const searchDocuments = tool(
  async ({ query }) => {
    console.log(`  📚 [Researcher Tool: searchDocuments] query="${query}"`);
    return JSON.stringify({
      query,
      documents: [
        {
          docId: "RFC-2026-04",
          title: "Internal Postmortem: Q3 Redis Outage & Dual-Write Desync",
          sourceUrl: "internal://docs/postmortem-q3-redis",
          excerpt:
            "During the Q3 failover, 4,200 billing webhook jobs were lost during Redis replica promotion because AOF fsync was set to everysec. Engineering proposed evaluating Postgres SKIP LOCKED or PgBoss.",
        },
      ],
    });
  },
  {
    name: "searchDocuments",
    description:
      "Search internal company RFCs, architecture docs, and incident postmortems.",
    schema: z.object({
      query: z
        .string()
        .describe("Keywords or semantic question for internal docs"),
    }),
  },
);
