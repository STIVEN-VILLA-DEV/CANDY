import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

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

export default clerkMiddleware(async (auth, req: NextRequest) => {
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

    // A04: rate limiting con Upstash solo en la API de análisis
    if (req.nextUrl.pathname.startsWith("/api/analyze")) {
      const identifier = userId; // Limitar por usuario autenticado
      
      try {
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

        if (!success) {
          console.warn("[security] Rate limit excedido:", { userId, path: req.nextUrl.pathname });
          return NextResponse.json(
            { error: "Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo." },
            { 
              status: 429, 
              headers: { 
                "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              } 
            }
          );
        }
      } catch (error) {
        // En caso de error con Upstash, permitimos la solicitud pero logueamos el error
        console.error("[security] Error en rate limit de Upstash:", error);
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
