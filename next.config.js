/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ["unpdf"],
  },
  // BORRAMOS LOS HEADERS DE SEGURIDAD PARA LA ENTREGA
  headers: async () => [],
};

module.exports = nextConfig;