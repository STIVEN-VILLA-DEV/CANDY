import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AnalyzeError, analyzePdf } from "@/lib/analyze";
import { isPdfMagicHeader } from "@/lib/pdf-magic";
import { ACCEPTED_MIME, MAX_FILE_SIZE } from "@/lib/utils";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Cabeceras de seguridad comunes para todas las respuestas de esta API
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function POST(req: Request) {
  const { userId, sessionId } = auth();
  
  if (!userId || !sessionId) {
    logger.warn("Intento de acceso no autorizado a la API de análisis", {
      ip: req.headers.get("x-forwarded-for"),
    });
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  // A05: validar Content-Type estrictamente
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type inválido" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  // A03: limitar tamaño del body antes de parsearlo para evitar DoS
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_FILE_SIZE + 1024 * 10) { // 10KB de margen para el form-data
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es demasiado grande" },
      { status: 413, headers: SECURITY_HEADERS }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    logger.error("Error al parsear FormData", { userId, error: err });
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  // A05: validar MIME type declarado
  if (file.type !== ACCEPTED_MIME) {
    return NextResponse.json(
      { error: "Solo se aceptan archivos PDF" },
      { status: 415, headers: SECURITY_HEADERS }
    );
  }

  // A05: validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 5 MB" },
      { status: 413, headers: SECURITY_HEADERS }
    );
  }

  // A05: validar nombre de archivo — solo caracteres seguros (evita Path Traversal e inyección)
  const safeNameRegex = /^[a-zA-Z0-9\-_ ]{1,100}\.pdf$/i;
  if (!safeNameRegex.test(file.name)) {
    logger.warn("Nombre de archivo sospechoso detectado", { userId, fileName: file.name });
    // No bloqueamos por nombre si es un error menor, pero lo registramos
    // Opcional: podrías renombrarlo internamente
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // A03: validar magic bytes — el MIME declarado puede ser falso
    if (!isPdfMagicHeader(bytes)) {
      logger.warn("Archivo con extensión PDF pero sin magic bytes válidos", { userId });
      return NextResponse.json(
        { error: "El archivo no es un PDF válido" },
        { status: 415, headers: SECURITY_HEADERS }
      );
    }

    const result = await analyzePdf(bytes);
    
    logger.info("Análisis completado con éxito", { 
      userId, 
      score: result.score, 
      findingsCount: result.findings.length 
    });

    return NextResponse.json(result, { headers: SECURITY_HEADERS });
  } catch (err) {
    const isKnownError = err instanceof AnalyzeError;
    const statusCode = isKnownError ? err.status : 500;
    const message = isKnownError ? err.exposeMessage : "Error interno al analizar el PDF";

    logger.error("Error durante el análisis de PDF", { 
      userId, 
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined
    });

    return NextResponse.json(
      { error: message },
      { status: statusCode, headers: SECURITY_HEADERS }
    );
  }
}
