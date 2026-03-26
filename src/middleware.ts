import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren sesión activa
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/analyze(.*)",
]);

// Rutas públicas explícitas — todo lo demás requiere auth
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// ---------------------------------------------------------------------------
// Rate limiting en memoria — simple y sin dependencias externas.
// Para producción con múltiples instancias, reemplazar con Redis (Upstash).
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10;  // máx 10 análisis por minuto por usuario

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return true;

  entry.count++;
  return false;
}

// Limpieza periódica para evitar memory leak en entornos long-running
function pruneRateLimitMap(): void {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  });
}

export default clerkMiddleware((auth, req: NextRequest) => {
  // Limpieza ocasional del mapa (1% de probabilidad por request)
  if (Math.random() < 0.01) pruneRateLimitMap();

  const { userId, sessionId } = auth();

  // Rutas protegidas: requieren userId Y sessionId válidos
  if (isProtectedRoute(req)) {
    if (!userId || !sessionId) {
      // A07: log de intento de acceso no autenticado
      console.warn("[security] Acceso no autenticado bloqueado:", {
        path: req.nextUrl.pathname,
        ip: req.headers.get("x-forwarded-for") ?? "unknown",
        ua: req.headers.get("user-agent")?.slice(0, 80) ?? "unknown",
      });
      auth().protect();
      return;
    }

    // A04: rate limiting solo en la API de análisis
    if (req.nextUrl.pathname.startsWith("/api/analyze")) {
      const identifier = userId; // por usuario autenticado
      if (isRateLimited(identifier)) {
        console.warn("[security] Rate limit excedido:", { userId, path: req.nextUrl.pathname });
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }
  }

  // Rutas no públicas y no protegidas explícitamente → proteger por defecto
  if (!isPublicRoute(req) && !isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Excluye archivos estáticos y _next internals, incluye todo lo demás
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf)).*)",
  ],
};
