import type { AnalysisResult } from "../types";
import { addFinding } from "./finding-utils";
import { extractDeterministicFindings } from "./extract-findings";
import { DEFAULT_ATS_RECOMMENDATIONS, generateAtsRecommendationsFromSummary } from "./gemini-recommendations";
import { computeScore, buildLocalSummary } from "./score-summary";
import { countOccurrences } from "./text-utils";

/**
 * Extrae el texto de un PDF usando `unpdf`, que está diseñado para
 * entornos serverless/edge y funciona correctamente con Next.js App Router.
 */
async function extractTextFromPdf(data: Uint8Array): Promise<string> {
  const { extractText } = await import("unpdf");
  const { text } = await extractText(data, { mergePages: true });
  return text ?? "";
}

/**
 * Analiza el binario del PDF para detectar si contiene una foto de perfil.
 *
 * Estrategia de dos capas:
 *
 * 1. Texto explícito — el CV menciona directamente que tiene foto.
 *    Usamos frases específicas para evitar falsos positivos con
 *    "perfil profesional", "foto de la empresa", etc.
 *
 * 2. Imágenes embebidas — inspeccionamos los objetos de imagen del PDF.
 *    Un CV con foto de perfil típicamente tiene UNA imagen grande al inicio
 *    (la foto) más posiblemente logos pequeños. Filtramos imágenes que
 *    claramente son íconos/logos por su tamaño declarado en el stream.
 *    Si hay al menos una imagen de tamaño considerable, es sospechoso.
 */
function detectProfilePhoto(binary: string, text: string): boolean {
  // --- Capa 1: mención explícita en el texto ---
  // Frases que indican intencionalmente una foto de perfil en el CV
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

  // --- Capa 2: análisis de objetos de imagen en el PDF ---
  // Extraemos todos los streams de imagen con sus dimensiones declaradas
  // Formato PDF: << /Width N /Height M ... /Subtype /Image >>
  const imageStreamRegex = /\/Subtype\s*\/Image[\s\S]{0,300}?\/Width\s+(\d+)[\s\S]{0,100}?\/Height\s+(\d+)/g;
  const matches = Array.from(binary.matchAll(imageStreamRegex));

  let largeImageCount = 0;
  for (const match of matches) {
    const width = parseInt(match[1] ?? "0", 10);
    const height = parseInt(match[2] ?? "0", 10);
    // Una foto de perfil típica en un CV tiene al menos 80x80px.
    // Logos e íconos suelen ser más pequeños o muy anchos y poco altos.
    const isSquarish = height > 0 && width / height < 3 && height / width < 3;
    if (width >= 80 && height >= 80 && isSquarish) {
      largeImageCount++;
    }
  }

  // Si hay al menos una imagen de tamaño razonable y proporciones de retrato/cuadrado
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
    // Usamos las recomendaciones por defecto si Gemini falla
  }

  return { score, findings, summary, atsRecommendations };
}
