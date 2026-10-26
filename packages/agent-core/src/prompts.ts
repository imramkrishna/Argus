export interface PromptVersion {
  id: string;
  template: string;
}

export const PROMPTS = {
  planner: {
    id: "planner@2026-10-26",
    template: `You are the Argus Planner. Break down the user's query into discrete, parallelizable research and analysis tasks...`
  },
  researcher: {
    id: "researcher@2026-10-26",
    template: `You are the Argus Research Specialist. Query documents and the web to fulfill your assigned subtask. Always cite sources...`
  },
  critic: {
    id: "critic@2026-10-26",
    template: `Evaluate the provided findings against the core rubric: 
    1. Are cost and throughput metrics internally consistent?
    2. Are all claims backed by source URIs?
    Identify specific gaps and demand follow-up tasks if needed.`
  },
  synthesizer: {
    id: "synthesizer@2026-10-26",
    template: `Compile the audited findings into a final Argus Report Schema. Determine the overarching confidence level (HIGH/MEDIUM/LOW)...`
  }
} as const;
