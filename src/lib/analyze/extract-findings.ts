import type { Finding } from "../types";
import { addFinding, hasNearbyKeyword, isLikelyCorporateEmail } from "./finding-utils";

export function extractDeterministicFindings(text: string): Finding[] {
  const findings: Finding[] = [];

  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawPhoneRegex = /(?:\+?\d[\d\s().-]{7,}\d)/g;
  const phoneContextKeywords = ["telefono", "cel", "celular", "movil", "whatsapp", "contacto", "llamar"];
  const idContextKeywords = ["cedula", "dni", "documento", "cc", "identificacion", "nit"];
  const cedulaRegex =
    /\b(?:c[eé]dula|cedula|dni|documento|cc)\s*(?:de\s*ciudadan[ií]a)?\s*[:#-]?\s*([0-9]{6,12})\b/gi;
  const ccShortRegex = /\b(?:c\.?\s*c\.?|cc)\s*[:#-]?\s*([0-9][0-9.\s]{5,14}[0-9])\b/gi;
  const nitRegex = /\b(?:n\.?\s*i\.?\s*t\.?|nit)\s*[:#-]?\s*([0-9][0-9.\-]{7,16}[0-9kK])\b/gi;
  const curpRegex = /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/gi;
  const rfcRegex = /\b[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}\b/gi;
  const dobRegex =
    /\b(?:fecha de nacimiento|nacimiento|dob)\s*[:\-]?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi;
  const linkedinRegex = /\bhttps?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/gi;
  const githubRegex = /\bhttps?:\/\/(?:www\.)?github\.com\/[^\s)]+/gi;
  const addressRegex =
    /\b(?:direcci[oó]n|calle|cl\.?|carrera|cra\.?|kr\.?|avenida|av\.?|transversal|tv\.?|diagonal|diag\.?|barrio|urbanizaci[oó]n|manzana|mz\.?|apto|apartamento|torre|casa)\b[^\n]{0,110}/gi;

  const emails = text.match(emailRegex) ?? [];
  for (const email of emails) {
    if (isLikelyCorporateEmail(email)) continue;
    addFinding(
      findings,
      "Email",
      email,
      "Es importante que uses un correo unicamente para el entorno profesional y no compartir tu correo personal.",
      "high"
    );
  }

  const cedulas = Array.from(text.matchAll(cedulaRegex));
  for (const match of cedulas) {
    const number = match[1] ?? match[0];
    const digits = String(number).replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 12) continue;
    addFinding(
      findings,
      "Cédula de ciudadanía",
      `C.C. N.º ${digits}`,
      "No es necesario poner la cédula en la hoja de vida pública; compártela solo si la empresa lo exige en una etapa formal.",
      "high"
    );
  }

  const ccMatches = Array.from(text.matchAll(ccShortRegex));
  for (const match of ccMatches) {
    const raw = match[1] ?? "";
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 12) continue;
    addFinding(
      findings,
      "Cédula de ciudadanía",
      `C.C. N.º ${digits}`,
      "No es necesario poner la cédula en la hoja de vida pública; compártela solo si la empresa lo exige en una etapa formal.",
      "high"
    );
  }

  const nitMatches = Array.from(text.matchAll(nitRegex));
  for (const match of nitMatches) {
    const raw = match[1] ?? "";
    const normalizedNit = raw.replace(/\s+/g, "");
    addFinding(
      findings,
      "NIT",
      `NIT ${normalizedNit}`,
      "Evita publicar NIT de empresas  en el CV; en lo general aplica más a facturación que a postulaciones.",
      "medium"
    );
  }

  const phoneCandidates = Array.from(text.matchAll(rawPhoneRegex));
  for (const candidate of phoneCandidates) {
    const phone = candidate[0];
    const start = candidate.index ?? 0;
    const end = start + phone.length;
    const digits = phone.replace(/\D/g, "");
    const normalizedDigits = digits.startsWith("57") && digits.length >= 12 ? digits.slice(2) : digits;
    const nearIdKeyword = hasNearbyKeyword(text, start, end, idContextKeywords);
    const nearPhoneKeyword = hasNearbyKeyword(text, start, end, phoneContextKeywords);
    const looksLikeMobile = normalizedDigits.length === 10 && normalizedDigits.startsWith("3");
    const looksLikeLandline = normalizedDigits.length === 7 || normalizedDigits.length === 8;
    const phoneLike = looksLikeMobile || (looksLikeLandline && nearPhoneKeyword);
    if (!phoneLike || nearIdKeyword) {
      continue;
    }
    addFinding(
      findings,
      "Teléfono",
      phone,
      "Considera un numero secundario para postulaciones y evita publicarlo en todas las versiones del CV.",
      "high"
    );
  }

  const curps = text.match(curpRegex) ?? [];
  for (const curp of curps) {
    addFinding(
      findings,
      "CURP (México)",
      curp,
      "No incluyas CURP en versiones públicas del CV; compártela solo cuando el proceso lo requiera de forma verificada.",
      "high"
    );
  }

  const rfcs = text.match(rfcRegex) ?? [];
  for (const rfc of rfcs) {
    addFinding(
      findings,
      "RFC (México)",
      rfc,
      "No publiques RFC personal en CV abierto; compártelo solo bajo solicitud formal y en contextos legítimos.",
      "high"
    );
  }

  const dobs = text.match(dobRegex) ?? [];
  for (const dob of dobs) {
    addFinding(
      findings,
      "Fecha de nacimiento",
      dob,
      "Evita incluir fecha de nacimiento completa; no aporta valor al filtro inicial.",
      "high"
    );
  }

  const addresses = text.match(addressRegex) ?? [];
  for (const address of addresses) {
    addFinding(
      findings,
      "Dirección",
      address,
      "En la hoja de vida basta con ciudad y departamento; evita barrio, nomenclatura completa o señas que te ubiquen en casa.",
      "high"
    );
  }

  const linkedins = text.match(linkedinRegex) ?? [];
  for (const link of linkedins) {
    addFinding(
      findings,
      "Redes sociales",
      link,
      "Revisa la privacidad de tu perfil de LinkedIn y evita exponer informacion sensible adicional.",
      "medium"
    );
  }

  const githubs = text.match(githubRegex) ?? [];
  for (const link of githubs) {
    addFinding(
      findings,
      "Redes sociales",
      link,
      "Verifica que tu perfil de GitHub no revele datos personales en bio, commits o repos publicos.",
      "medium"
    );
  }

  return findings;
}
