import { ReportType } from "../types";

export function renderReport(r: ReportType): string {
  const lines = [
    `================================================================`,
    `🎯 RECOMMENDATION (Confidence: ${r.confidence.toUpperCase()})`,
    `================================================================`,
    r.recommendation,
    `\n📊 EVIDENCE TABLE (${r.evidence.length} verified claims):`,
    ...r.evidence.map((e, i) => `  ${i + 1}. ${e.claim}\n     🔗 Source: ${e.source}`),
    `\n⚠️ RISKS & MITIGATIONS:`,
    ...r.risks.map(
      (rk) => `  - [${rk.severity.toUpperCase()}] ${rk.risk}\n    🛡️ Mitigation: ${rk.mitigation}`
    ),
  ];
  return lines.join("\n");
}