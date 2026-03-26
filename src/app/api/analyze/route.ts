import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AnalyzeError, analyzePdf } from "@/lib/analyze";
import { isPdfMagicHeader } from "@/lib/pdf-magic";
import { ACCEPTED_MIME, MAX_FILE_SIZE } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Cabeceras de seguridad comunes para todas las respuestas de esta API
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex",
};

export async function POST(req: Request) {
  // A01: doble verificación de auth — el middleware ya lo valida,
  // pero la API verifica independientemente (defense in depth).
  const { userId, sessionId } = auth();
  if (!userId || !sessionId) {
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
  if (contentLength > MAX_FILE_SIZE + 1024) {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es demasiado grande" },
      { status: 413, headers: SECURITY_HEADERS }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
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

  // A05: validar nombre de archivo — solo caracteres seguros
  const safeName = /^[\w\-. ]{1,255}$/;
  if (!safeName.test(file.name)) {
    return NextResponse.json(
      { error: "Nombre de archivo inválido" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // A03: validar magic bytes — el MIME declarado puede ser falso
  if (!isPdfMagicHeader(bytes)) {
    return NextResponse.json(
      { error: "El archivo no es un PDF válido" },
      { status: 415, headers: SECURITY_HEADERS }
    );
  }

  try {
    const result = await analyzePdf(bytes);
    return NextResponse.json(result, { headers: SECURITY_HEADERS });
  } catch (err) {
    // A09: log interno con contexto, sin exponer detalles al cliente
    console.error("[analyze] Error inesperado:", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    if (err instanceof AnalyzeError) {
      return NextResponse.json(
        { error: err.exposeMessage },
        { status: err.status, headers: SECURITY_HEADERS }
      );
    }

    const message = err instanceof Error ? err.message : "";
    if (message === "No se pudo extraer texto del PDF") {
      return NextResponse.json(
        { error: "No se pudo leer el contenido del PDF (¿escaneado o protegido?)" },
        { status: 422, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { error: "Error durante el análisis" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
