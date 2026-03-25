import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Finding, RiskLevel } from "../types";
import { AnalyzeError, classifyModelError, getErrorMessage, isModelUnavailableError } from "./errors";

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-8b";

export const DEFAULT_ATS_RECOMMENDATIONS = [
  "Usa una versión pública de la hoja de vida sin cédula, NIT, dirección exacta ni celular personal; deja un canal de contacto profesional.",
  "Separa el correo y el número que das a reclutadores del que usas para banca o redes; así reduces phishing y suplantación.",
  "Para ATS en Colombia, prioriza logros cuantificables, roles y herramientas; la ubicación puede ser solo ciudad y departamento.",
] as const;

export async function generateAtsRecommendationsFromSummary(
  findings: Finding[],
  score: number
): Promise<string[]> {
  const fallback = [...DEFAULT_ATS_RECOMMENDATIONS];

  if (!geminiApiKey) {
    return fallback;
  }

  const byCategory = findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.category] = (acc[finding.category] ?? 0) + 1;
    return acc;
  }, {});
  const byRisk = findings.reduce<Record<RiskLevel, number>>(
    (acc, finding) => {
      acc[finding.risk] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const anonymizedInput = {
    score,
    findingsCount: findings.length,
    categories: byCategory,
    riskDistribution: byRisk,
  };

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const modelCandidates = Array.from(
    new Set([geminiModel, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"])
  );

  const prompt = `Eres consultor de privacidad para hojas de vida en Colombia.
Recibiras SOLO un resumen anonimizado sin datos personales (sin cedula, telefonos, direcciones ni texto del CV).
Genera 3 recomendaciones breves en espanol con enfoque en Colombia para:
1) reducir riesgo de suplantacion,
2) mantener utilidad para ATS,
3) mejorar seguridad al compartir CV.
Devuelve SOLO JSON valido:
{ "atsRecommendations": ["...", "...", "..."] }

Resumen anonimizado:
${JSON.stringify(anonymizedInput)}`;

  let raw: string | null = null;
  let lastError: unknown = null;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      raw = response.response.text();
      break;
    } catch (err) {
      lastError = err;
      if (!isModelUnavailableError(err)) {
        throw classifyModelError(err);
      }
    }
  }

  if (!raw) {
    const detail = getErrorMessage(lastError);
    throw new AnalyzeError(
      `No hay modelos disponibles para recomendaciones. Ultimo error: ${detail}`,
      502,
      "No hay un modelo de Gemini disponible para generar recomendaciones."
    );
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new AnalyzeError("Respuesta de IA invalida: no contiene JSON para recomendaciones");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { atsRecommendations?: string[] };
    if (!Array.isArray(parsed.atsRecommendations) || !parsed.atsRecommendations.length) {
      return fallback;
    }
    return parsed.atsRecommendations.slice(0, 3);
  } catch {
    return fallback;
  }
}
