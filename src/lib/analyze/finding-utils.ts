import type { Finding, RiskLevel } from "../types";

const CORPORATE_EMAIL_ALIASES = [
  "contacto",
  "ventas",
  "rrhh",
  "soporte",
  "info",
  "admin",
  "hello",
  "careers",
  "reclutamiento",
  "jobs",
  "hr",
];

function shortId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function normalizeDetected(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

export function isLikelyCorporateEmail(email: string): boolean {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return CORPORATE_EMAIL_ALIASES.some((alias) => local === alias || local.startsWith(`${alias}.`));
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function hasNearbyKeyword(text: string, start: number, end: number, keywords: string[]): boolean {
  const min = Math.max(0, start - 24);
  const max = Math.min(text.length, end + 24);
  const window = normalizeForSearch(text.slice(min, max));
  return keywords.some((keyword) => window.includes(keyword));
}

export function addFinding(
  findings: Finding[],
  category: string,
  detected: string,
  recommendation: string,
  risk: RiskLevel
): void {
  const normalized = normalizeDetected(detected);
  if (!normalized) return;
  if (findings.some((f) => f.category === category && f.detected.toLowerCase() === normalized.toLowerCase())) {
    return;
  }
  findings.push({
    id: shortId("f", findings.length),
    category,
    detected: normalized,
    recommendation,
    risk,
  });
}
