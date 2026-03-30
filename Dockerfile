FROM oven/bun:latest

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lockb ./

# Instalar dependencias
RUN bun install

# Copiar el resto del código
COPY . .

# Construir la app de Next.js
RUN bun run build

# Exponer el puerto
EXPOSE 3000

# Iniciar la app
CMD ["bun", "run", "start"]