import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ACCEPTED_MIME = "application/pdf";
export const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export function validateFile(file: File): string | null {
  if (file.type !== ACCEPTED_MIME) return "Solo se aceptan archivos PDF.";
  if (file.size > MAX_FILE_SIZE) return "El archivo no puede superar 5MB.";
  return null;
}

export const STATUS_MESSAGES: Record<string, string> = {
  uploading: "Cargando archivo de forma segura...",
  extracting: "Analizando metadatos del PDF...",
  analyzing: "Buscando PII (Información Personal Identificable)...",
  done: "Análisis completado.",
  error: "Error durante el análisis.",
};
