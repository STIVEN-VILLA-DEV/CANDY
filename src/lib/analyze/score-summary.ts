import type { Finding } from "../types";

export function computeScore(findings: Finding[]): number {
  const penalties = findings.reduce((acc, finding) => {
    if (finding.risk === "high") return acc + 18;
    if (finding.risk === "medium") return acc + 8;
    return acc + 3;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalties));
}

export function buildLocalSummary(score: number, findings: Finding[]): string {
  const high = findings.filter((f) => f.risk === "high").length;
  const medium = findings.filter((f) => f.risk === "medium").length;
  if (!findings.length) {
    return "No se encontraran brechas de seguridad en tu cv gracias por mantener tu privacidad segura.";
  }
  return `En tu CV se hallaron ${findings.length} posibles exposiciones de datos personales (${high} de riesgo alto, ${medium} de riesgo medio). Puntuación de privacidad: ${score}/100.`;
}
