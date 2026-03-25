import pdfParse from "pdf-parse";
import type { AnalysisResult } from "../types";
import { addFinding } from "./finding-utils";
import { extractDeterministicFindings } from "./extract-findings";
import { DEFAULT_ATS_RECOMMENDATIONS, generateAtsRecommendationsFromSummary } from "./gemini-recommendations";
import { computeScore, buildLocalSummary } from "./score-summary";
import { countOccurrences } from "./text-utils";

function toNodeBufferForPdfParse(data: Uint8Array): Buffer {
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

export async function analyzePdf(data: Uint8Array): Promise<AnalysisResult> {
  const buffer = toNodeBufferForPdfParse(data);
  const { text } = await pdfParse(buffer);

  if (!text || text.trim().length < 50) {
    throw new Error("No se pudo extraer texto del PDF");
  }

  const sanitizedText = text.slice(0, 12000);
  const findings = extractDeterministicFindings(sanitizedText);
  const binary = new TextDecoder("latin1").decode(data);
  const imageObjects = countOccurrences(binary, "/Subtype /Image");
  const mentionsPhoto = /\b(foto|photo|perfil|headshot)\b/i.test(sanitizedText);
  if (mentionsPhoto || imageObjects >= 2) {
    addFinding(
      findings,
      "Foto",
      "Posible foto de perfil en la hoja de vida",
      "En Colombia muchos formatos no exigen foto; quitarla reduce sesgo y evita que la imagen se use fuera de contexto o para suplantación.",
      "high"
    );
  }
  const score = computeScore(findings);
  const summary = buildLocalSummary(score, findings);

  let atsRecommendations: string[] = [...DEFAULT_ATS_RECOMMENDATIONS];

  try {
    atsRecommendations = await generateAtsRecommendationsFromSummary(findings, score);
  } catch {
  }

  return {
    score,
    findings,
    summary,
    atsRecommendations,
  };
}
