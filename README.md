# 🔒 Candy - Analizador de Privacidad 

**Candy** es una plataforma moderna y segura diseñada para ayudar a los candidatos a proteger su información personal antes de enviar sus hojas de vida. Utiliza algoritmos de detección local para identificar datos sensibles que podrían exponer al usuario a riesgos de seguridad fisicos y digitales.

## 🔒🔒 Características Principales
documentos de identidad (Cédula, NIT, CURP, RFC), direcciones físicas y redes sociales.
- **Análisis de Fotos**: Detecta automáticamente si el CV contiene una fotografía para advertir sobre posibles sesgos en procesos de selección.
- **Puntaje de Privacidad**: Calcula un índice de seguridad (0-100) basado en la cantidad y criticidad de los datos expuestos.
- **Recomendaciones con IA**: Genera consejos personalizados utilizando **Google Gemini AI** para optimizar el CV tanto para humanos como para sistemas ATS pero la ia nunca ve los datos personales del usuario solo se le pasa un resumen de lo que se ha encontrado en el cv por ejemplo "en el cv se ha encontrado que el usuario tiene su direccion muy especifica como color de casa barrio y numero de casa".
- **Privacidad por Diseño**: Los datos personales **nunca** se almacenan en bases de datos ni se envían en texto plano a la IA. El procesamiento es efímero y seguro.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Autenticación**: [Clerk](https://clerk.com/)
- **IA**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Base de Datos de Rate Limit**: [Upstash Redis](https://upstash.com/) //se acalara de que no se guarda ningun dato personal solo se usa para dar una mejor seguridad a la plataforma 
- **Estilos**: Tailwind CSS & Framer Motion
- **Seguridad**: Middleware de protección, CSP estricta y validación de Magic Bytes para archivos.

## ⚙️ Configuración del Proyecto

### 1. Requisitos Previos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (v18+) y un gestor de paquetes mi favito es bun.

### 2. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes llaves:

```env
# Clerk (Autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Gemini (IA)
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-1.5-flash # Opcional

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=tu_token_aqui
```

### 3. Instalación y Ejecución

```bash
# Instalar dependencias
bun install

# Ejecutar en modo desarrollo
bun dev
```

## 🔒 Seguridad (OWASP Top 10)

Este proyecto ha sido auditado siguiendo las métricas de **OWASP**, implementando:
- **Rate Limiting Profesional**: Protegido contra ataques DoS mediante Upstash.
- **Content Security Policy (CSP)**: Bloqueo de scripts no autorizados y telemetría externa.
- **Logging y Auditoría**: Sistema de logs centralizado para monitorear intentos de acceso y errores críticos.
- **Validación Estricta de Archivos**: Verificación de encabezados binarios para asegurar que los archivos sean PDFs reales.

---
Desarrollado con ❤️ para mejorar la seguridad digital de los profesionales.
