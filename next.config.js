/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // unpdf (pdfjs-dist) debe resolverse en runtime Node.js, no bundlearse con webpack
    serverComponentsExternalPackages: ["unpdf"],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://clerk.com https://*.clerk.accounts.dev",
            "worker-src 'self' blob:",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "img-src 'self' data: https:",
            "connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://clerk-telemetry.com https://generativelanguage.googleapis.com",
            "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            // Comentado para desarrollo local si no usas SSL (HTTPS)
            // "upgrade-insecure-requests",
          ].join("; "),
        },
      ],
    },
  ],
};

module.exports = nextConfig;
