import type { AnalysisResult } from "../types";
import { addFinding } from "./finding-utils";
import { extractDeterministicFindings } from "./extract-findings";
import { DEFAULT_ATS_RECOMMENDATIONS, generateAtsRecommendationsFromSummary } from "./gemini-recommendations";
import { computeScore, buildLocalSummary } from "./score-summary";
import { countOccurrences } from "./text-utils";

async function extractTextFromPdf(data: Uint8Array): Promise<string> {
  const { extractText } = await import("unpdf");
  const { text } = await extractText(data, { mergePages: true });
  return text ?? "";
}


function detectProfilePhoto(binary: string, text: string): boolean {
  const explicitPhrases = [
    /\bfoto\s+de\s+perfil\b/i,
    /\bfotograf[ií]a\s+(?:de\s+)?perfil\b/i,
    /\bincluye?\s+foto\b/i,
    /\badjunta?\s+foto\b/i,
    /\bcon\s+foto\b/i,
    /\bheadshot\b/i,
    /\bprofile\s+(?:photo|picture|pic)\b/i,
  ];
  if (explicitPhrases.some((re) => re.test(text))) return true;

  
  const imageStreamRegex = /\/Subtype\s*\/Image[\s\S]{0,300}?\/Width\s+(\d+)[\s\S]{0,100}?\/Height\s+(\d+)/g;
  const matches = Array.from(binary.matchAll(imageStreamRegex));

  let largeImageCount = 0;
  for (const match of matches) {
    const width = parseInt(match[1] ?? "0", 10);
    const height = parseInt(match[2] ?? "0", 10);
    const isSquarish = height > 0 && width / height < 3 && height / width < 3;
    if (width >= 80 && height >= 80 && isSquarish) {
      largeImageCount++;
    }
  }

  
  return largeImageCount >= 1;
}

export async function analyzePdf(data: Uint8Array): Promise<AnalysisResult> {
  const MIN_TEXT_CHARS = 3;

  let text = "";
  try {
    text = await extractTextFromPdf(data);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[analyze-pdf] Error extrayendo texto:", err);
    }
  }

  const sanitizedText = text.slice(0, 12000);
  const binary = new TextDecoder("latin1").decode(data);
  const hasEnoughText = sanitizedText.trim().length >= MIN_TEXT_CHARS;

  const findings = extractDeterministicFindings(sanitizedText);

  if (detectProfilePhoto(binary, sanitizedText)) {
    addFinding(
      findings,
      "Foto de perfil",
      "Se detectó una posible foto de perfil en el CV",
      "Incluir foto en el CV puede generar discriminación por apariencia, edad o etnia. En Colombia y la mayoría de países no es obligatoria; omitirla es la práctica recomendada.",
      "high"
    );
  }

  const score = computeScore(findings);
  let summary = buildLocalSummary(score, findings);

  if (!hasEnoughText && findings.length === 0) {
    summary =
      "No se pudo extraer texto del PDF. Si el CV es un escaneo (imágenes), necesitas OCR para poder analizar el contenido. Revisa la calidad del PDF y vuelve a intentarlo.";
  }

  let atsRecommendations: string[] = [...DEFAULT_ATS_RECOMMENDATIONS];
  try {
    atsRecommendations = await generateAtsRecommendationsFromSummary(findings, score);
  } catch {
    // si la ia falla en dar sus recomendaciones entonces usamos las recomendaciones por defecto 
  }

  return { score, findings, summary, atsRecommendations };
}
