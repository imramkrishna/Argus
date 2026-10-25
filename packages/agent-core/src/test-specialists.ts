import { researcher,dataAnalyst } from "./specialist";

async function main() {
  console.log("=== 1. Testing Standalone Researcher Specialist ===");
  const researchOut = await researcher.invoke(
    {
      messages: [
        {
          role: "user",
          content:
            "Compare the durability, throughput limits, and operational pitfalls of migrating a job queue from Redis BullMQ to PostgreSQL SKIP LOCKED.",
        },
      ],
    },
    { recursionLimit: 10 } // Bounds the agent loop like modelCallLimitMiddleware
  );

  console.log("\n✅ Researcher Structured Output (out.structuredResponse):");
  console.dir(researchOut.structuredResponse, { depth: null });

  console.log("\n=== 2. Testing Standalone Data Analyst Specialist ===");
  const analystOut = await dataAnalyst.invoke(
    {
      messages: [
        {
          role: "user",
          content:
            "Analyze our current production Redis job queue vs our Postgres primary and staging POC. Can our Postgres instance handle our peak queue RPS, and what are the latency and cost trade-offs?",
        },
      ],
    },
    { recursionLimit: 10 }
  );

  console.log("\n✅ Data Analyst Structured Output (out.structuredResponse):");
  console.dir(analystOut.structuredResponse, { depth: null });
}

main().catch((err) => {
  console.error("Error running specialists:", err);
  process.exit(1);
});
