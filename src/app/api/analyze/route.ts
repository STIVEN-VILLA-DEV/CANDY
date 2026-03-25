import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AnalyzeError, analyzePdf } from "@/lib/analyze";
import { isPdfMagicHeader } from "@/lib/pdf-magic";
import { ACCEPTED_MIME, MAX_FILE_SIZE } from "@/lib/utils";


export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Content-Type inválido" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (file.type !== ACCEPTED_MIME) {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF" }, { status: 415 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo supera el límite de 5MB" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (!isPdfMagicHeader(bytes)) {
    return NextResponse.json({ error: "El archivo no es un PDF válido" }, { status: 415 });
  }

  try {
    const result = await analyzePdf(bytes);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[analyze]", err);
    if (err instanceof AnalyzeError) {
      return NextResponse.json({ error: err.exposeMessage }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "";
    if (message === "No se pudo extraer texto del PDF") {
      return NextResponse.json(
        { error: "No se pudo leer el contenido del PDF (¿escaneado o protegido?)" },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: "Error durante el análisis" }, { status: 500 });
  }
}
