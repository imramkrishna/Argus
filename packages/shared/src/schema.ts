import { z } from "zod";

export const SubtaskKindSchema = z.enum(["research", "data"]);
export type SubtaskKind = z.infer<typeof SubtaskKindSchema>;

export const SubtaskSchema = z.object({
  id: z.string().describe("Unique short identifier for the subtask, e.g., 'res-1' or 'data-1'"),
  kind: SubtaskKindSchema.describe("'research' for external docs/web/benchmarks; 'data' for internal Postgres operational telemetry"),
  task: z.string().describe("A specific, self-contained question or analysis instruction for the specialist"),
});
export type Subtask = z.infer<typeof SubtaskSchema>;

export const ResearchPlanSchema = z.object({
  subtasks: z
    .array(SubtaskSchema)
    .min(1)
    .max(6)
    .describe("Decomposed parallel subtasks required to answer the user's question"),
});
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

export const FindingItemSchema = z.object({
  claim: z.string().describe("A specific technical or factual claim answering part of the task"),
  evidence: z.string().describe("Direct quote, benchmark number, or concrete supporting detail"),
  sourceUrl: z.string().describe("URL or internal document citation ID where the evidence was found"),
});
export type FindingItem = z.infer<typeof FindingItemSchema>;

export const FindingsSchema = z.object({
  findings: z.array(FindingItemSchema).describe("Verified claims with supporting evidence and sources"),
  gaps: z.array(z.string()).describe("Questions or facts that could not be verified with available tools"),
});
export type Findings = z.infer<typeof FindingsSchema>;

export const MetricRowSchema = z.object({
  metric: z.string().describe("Name of the operational metric (e.g., 'p99_queue_latency_ms', 'monthly_cost_usd')"),
  value: z.string().describe("Computed numeric value with unit (e.g., '42.8 ms', '14,200 jobs/sec')"),
  context: z.string().describe("Comparison baseline, time window, or statistical significance note"),
});
export type MetricRow = z.infer<typeof MetricRowSchema>;

export const AnalysisSchema = z.object({
  summary: z.string().describe("Concise synthesis of what the internal operational data shows"),
  table: z.array(MetricRowSchema).describe("Structured table of quantitative metrics and computed stats"),
  sqlQueriesUsed: z.array(z.string()).describe("Exact read-only SQL queries executed to derive these metrics"),
  gaps: z.array(z.string()).describe("Missing telemetry or operational data gaps"),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const CritiqueGapSchema = z.object({
  issue: z.string().describe("Specific flaw, missing benchmark, unverified claim, or unqueried operational metric"),
  kind: SubtaskKindSchema.describe("Which specialist ('research' or 'data') should resolve this gap"),
  followUpTask: z.string().describe("Targeted, self-contained instruction for the specialist to close the gap"),
});
export type CritiqueGap = z.infer<typeof CritiqueGapSchema>;

export const CritiqueSchema = z.object({
  verdict: z.enum(["sufficient", "gaps"]).describe("'sufficient' if ready to synthesize; 'gaps' if critical evidence is missing"),
  gaps: z
    .array(CritiqueGapSchema)
    .max(3)
    .describe("Up to 3 high-priority follow-up tasks required before writing the final report"),
});
export type Critique = z.infer<typeof CritiqueSchema>;

export const EvidenceRowSchema = z.object({
  claim: z.string().describe("Key factual or operational claim supporting the decision"),
  sourceOrMetric: z.string().describe("Source URL, document reference, or internal SQL metric"),
  domain: SubtaskKindSchema.describe("Whether this evidence came from external 'research' or internal 'data'"),
});

export const RiskItemSchema = z.object({
  risk: z.string().describe("Concrete technical, operational, or financial risk"),
  severity: z.enum(["low", "medium", "high"]),
  mitigation: z.string().describe("Actionable engineering mitigation strategy"),
});

export const ReportSchema = z.object({
  title: z.string(),
  recommendation: z.string().describe("Clear, decisive architectural or operational recommendation"),
  confidence: z.enum(["low", "medium", "high"]).describe("Confidence level justified by evidence coverage"),
  confidenceRationale: z.string().describe("Why this confidence level was assigned, noting any unresolved gaps"),
  executiveSummary: z.string().describe("2-3 paragraph synthesis combining external research and internal operational data"),
  evidenceTable: z.array(EvidenceRowSchema).min(1).describe("Every major claim linked to its concrete evidence"),
  analysisSummary: z.array(MetricRowSchema).describe("Key quantitative metrics from internal operational data"),
  risks: z.array(RiskItemSchema).describe("Identified migration or implementation risks and mitigations"),
});
export type Report = z.infer<typeof ReportSchema>;

