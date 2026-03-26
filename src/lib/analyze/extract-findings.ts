import type { Finding } from "../types";
import { addFinding, hasNearbyKeyword, isLikelyCorporateEmail } from "./finding-utils";

// Límites de seguridad para evitar ReDoS y respuestas infladas
const MAX_INPUT_CHARS = 12_000;
const MAX_FINDINGS = 40;

// ---------------------------------------------------------------------------
// Regex — definidas fuera de la función para no recompilar en cada llamada
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[A-Za-z]{2,}\b/g;

// Teléfono: evitamos cuantificadores anidados para prevenir ReDoS
const PHONE_REGEX = /\+?\d[\d]{6,14}/g;

const CEDULA_REGEX =
  /\b(?:c[eé]dula|cedula|dni|documento|cc)\s*(?:de\s*ciudadan[ií]a)?\s*[:#-]?\s*([0-9]{6,12})\b/gi;

const CC_SHORT_REGEX = /\b(?:c\.?\s*c\.?|cc)\s*[:#-]?\s*([0-9]{6,12})\b/gi;

const NIT_REGEX = /\b(?:n\.?\s*i\.?\s*t\.?|nit)\s*[:#-]?\s*([0-9]{7,12}-?[0-9kK])\b/gi;

// CURP México — formato oficial estricto (18 caracteres exactos)
const CURP_REGEX = /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g;

// RFC México — más estricto: 12 chars (persona moral) o 13 (persona física)
// Evita falsos positivos con siglas comunes
const RFC_REGEX = /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/g;
// Palabras comunes que coinciden con el patrón RFC pero no lo son
const RFC_FALSE_POSITIVES = new Set(["PARA", "COMO", "ESTE", "ESTA", "PERO", "SINO"]);

// Fecha de nacimiento — incluye año suelto con contexto
const DOB_FULL_REGEX =
  /\b(?:fecha\s+de\s+nacimiento|nacimiento|dob|born)\s*[:\-]?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi;
const DOB_YEAR_REGEX =
  /\b(?:nacido\s+en|born\s+in|año\s+de\s+nacimiento)\s*[:\-]?\s*(19|20)\d{2}\b/gi;

// Dirección — requiere que la palabra clave vaya seguida de un número para
// evitar falsos positivos con "cl." (cláusula), "dirección de correo", etc.
// Patrón: keyword + espacio opcional + número obligatorio + resto acotado.
const ADDRESS_STREET_REGEX =
  /\b(?:calle|cl\.?|carrera|cra\.?|kr\.?|avenida|av\.?|transversal|tv\.?|diagonal|diag\.?)\s*\d+[\w\s.,#°\-]{0,60}/gi;

// "dirección" solo cuenta si va seguida de nomenclatura (número o abreviatura vial)
const ADDRESS_LABEL_REGEX =
  /\bdirecci[oó]n\s*[:\-]?\s*(?:calle|cl\.?|carrera|cra\.?|kr\.?|avenida|av\.?|transversal|tv\.?|\d)[\w\s.,#°\-]{0,60}/gi;

// Barrio/apto/torre también requieren número o nombre concreto después
const ADDRESS_DETAIL_REGEX =
  /\b(?:barrio|urbanizaci[oó]n|manzana|mz\.?|apto\.?|apartamento|torre)\s+[\w\d][\w\s.,#°\-]{0,50}/gi;

// Redes sociales
const LINKEDIN_REGEX = /\bhttps?:\/\/(?:www\.)?linkedin\.com\/[^\s)]{3,100}/gi;
const GITHUB_REGEX = /\bhttps?:\/\/(?:www\.)?github\.com\/[^\s)]{1,100}/gi;
const INSTAGRAM_REGEX = /\bhttps?:\/\/(?:www\.)?instagram\.com\/[^\s)]{1,100}/gi;
const TWITTER_REGEX = /\bhttps?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\s)]{1,100}/gi;
const TIKTOK_REGEX = /\bhttps?:\/\/(?:www\.)?tiktok\.com\/[^\s)]{1,100}/gi;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Enmascara datos sensibles para no exponerlos completos en la respuesta */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[email]";
  const visible = local.length > 3 ? local.slice(0, 3) : local[0];
  return `${visible}***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4
    ? `${digits.slice(0, 3)}****${digits.slice(-2)}`
    : "****";
}

function maskId(digits: string): string {
  return digits.length >= 4
    ? `${digits.slice(0, 3)}${"*".repeat(digits.length - 3)}`
    : "****";
}

// ---------------------------------------------------------------------------
// Extractor principal
// ---------------------------------------------------------------------------

export function extractDeterministicFindings(rawText: string): Finding[] {
  // Sanitización de entrada: limitar longitud y eliminar caracteres de control
  const text = rawText
    .slice(0, MAX_INPUT_CHARS)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");

  const findings: Finding[] = [];

  const addIfRoom = (...args: Parameters<typeof addFinding>) => {
    if (findings.length >= MAX_FINDINGS) return;
    addFinding(...args);
  };

  // --- Email ---
  for (const email of Array.from(text.matchAll(EMAIL_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    if (isLikelyCorporateEmail(email[0])) continue;
    addIfRoom(
      findings,
      "Email",
      maskEmail(email[0]),
      "Usa un correo exclusivamente profesional para postulaciones y evita exponer tu correo personal.",
      "high"
    );
  }

  // --- Cédula (formato largo) ---
  for (const match of Array.from(text.matchAll(CEDULA_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    const digits = (match[1] ?? match[0]).replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 12) continue;
    addIfRoom(
      findings,
      "Cédula de ciudadanía",
      `C.C. ${maskId(digits)}`,
      "No incluyas la cédula en la hoja de vida pública; compártela solo cuando la empresa lo exija en una etapa formal del proceso.",
      "high"
    );
  }

  // --- Cédula (formato corto: C.C. / cc) ---
  for (const match of Array.from(text.matchAll(CC_SHORT_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    const digits = (match[1] ?? "").replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 12) continue;
    addIfRoom(
      findings,
      "Cédula de ciudadanía",
      `C.C. ${maskId(digits)}`,
      "No incluyas la cédula en la hoja de vida pública; compártela solo cuando la empresa lo exija en una etapa formal del proceso.",
      "high"
    );
  }

  // --- NIT ---
  for (const match of Array.from(text.matchAll(NIT_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    const raw = (match[1] ?? "").replace(/\s+/g, "");
    addIfRoom(
      findings,
      "NIT",
      `NIT ${maskId(raw.replace(/\D/g, ""))}`,
      "Evita publicar el NIT en el CV; es un dato fiscal que no aporta valor en una postulación.",
      "medium"
    );
  }

  // --- Teléfono ---
  const phoneContextKeywords = ["telefono", "cel", "celular", "movil", "whatsapp", "contacto", "llamar", "tel"];
  const idContextKeywords = ["cedula", "dni", "documento", "cc", "identificacion", "nit"];

  for (const candidate of Array.from(text.matchAll(PHONE_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    const phone = candidate[0];
    const start = candidate.index ?? 0;
    const end = start + phone.length;
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.startsWith("57") && digits.length >= 12 ? digits.slice(2) : digits;

    const nearId = hasNearbyKeyword(text, start, end, idContextKeywords);
    const nearPhone = hasNearbyKeyword(text, start, end, phoneContextKeywords);
    const isMobile = normalized.length === 10 && normalized.startsWith("3");
    const isLandline = (normalized.length === 7 || normalized.length === 8) && nearPhone;

    if ((!isMobile && !isLandline) || nearId) continue;

    addIfRoom(
      findings,
      "Teléfono",
      maskPhone(phone),
      "Considera usar un número secundario para postulaciones y evita publicarlo en todas las versiones del CV.",
      "high"
    );
  }

  // --- CURP (México) ---
  for (const curp of Array.from(text.matchAll(CURP_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    addIfRoom(
      findings,
      "CURP (México)",
      `${curp[0].slice(0, 4)}**********`,
      "No incluyas la CURP en versiones públicas del CV; compártela solo cuando el proceso lo requiera de forma verificada.",
      "high"
    );
  }

  // --- RFC (México) ---
  for (const rfc of Array.from(text.matchAll(RFC_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    if (RFC_FALSE_POSITIVES.has(rfc[0])) continue;
    addIfRoom(
      findings,
      "RFC (México)",
      `${rfc[0].slice(0, 4)}*****`,
      "No publiques el RFC personal en un CV abierto; compártelo solo bajo solicitud formal y en contextos legítimos.",
      "high"
    );
  }

  // --- Fecha de nacimiento (completa) ---
  for (const dob of Array.from(text.matchAll(DOB_FULL_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    addIfRoom(
      findings,
      "Fecha de nacimiento",
      dob[0].trim(),
      "Evita incluir la fecha de nacimiento; no aporta valor al filtro inicial y puede generar discriminación por edad.",
      "high"
    );
  }

  // --- Año de nacimiento con contexto ---
  for (const dob of Array.from(text.matchAll(DOB_YEAR_REGEX))) {
    if (findings.length >= MAX_FINDINGS) break;
    addIfRoom(
      findings,
      "Fecha de nacimiento",
      dob[0].trim(),
      "Indicar el año de nacimiento permite calcular tu edad y puede generar discriminación; omítelo del CV.",
      "medium"
    );
  }

  // --- Dirección ---
  const addressMatches = [
    ...Array.from(text.matchAll(ADDRESS_STREET_REGEX)),
    ...Array.from(text.matchAll(ADDRESS_LABEL_REGEX)),
    ...Array.from(text.matchAll(ADDRESS_DETAIL_REGEX)),
  ];
  for (const address of addressMatches) {
    if (findings.length >= MAX_FINDINGS) break;
    const value = address[0].trim();
    addIfRoom(
      findings,
      "Dirección",
      value.slice(0, 60) + (value.length > 60 ? "…" : ""),
      "En el CV basta con ciudad y departamento; evita barrio, nomenclatura completa o señas que te ubiquen en casa.",
      "high"
    );
  }

  // --- Redes sociales ---
  const socialNetworks: Array<{ regex: RegExp; name: string; tip: string }> = [
    {
      regex: LINKEDIN_REGEX,
      name: "LinkedIn",
      tip: "Revisa la privacidad de tu perfil de LinkedIn y evita exponer información sensible adicional.",
    },
    {
      regex: GITHUB_REGEX,
      name: "GitHub",
      tip: "Verifica que tu perfil de GitHub no revele datos personales en bio, commits o repositorios públicos.",
    },
    {
      regex: INSTAGRAM_REGEX,
      name: "Instagram",
      tip: "Incluir Instagram en el CV expone tu vida personal; agrégalo solo si es un perfil profesional.",
    },
    {
      regex: TWITTER_REGEX,
      name: "Twitter / X",
      tip: "Incluir Twitter/X en el CV puede exponer opiniones personales; agrégalo solo si es un perfil profesional.",
    },
    {
      regex: TIKTOK_REGEX,
      name: "TikTok",
      tip: "Incluir TikTok en el CV expone contenido personal; agrégalo solo si es un perfil profesional relevante.",
    },
  ];

  for (const { regex, name, tip } of socialNetworks) {
    for (const match of Array.from(text.matchAll(regex))) {
      if (findings.length >= MAX_FINDINGS) break;
      addIfRoom(findings, "Redes sociales", `${name}: ${match[0].slice(0, 60)}`, tip, "medium");
    }
  }

  return findings;
}
