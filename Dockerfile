# ============================================================================
#  proCard - Dockerfile
#  Next.js 16 (App Router) + Prisma (SQLite) + NextAuth
#  El mismo servidor de Next sirve el frontend Y las rutas /api (backend).
# ============================================================================

# ---------- Stage 1: deps (instala dependencias con cache) ----------
FROM node:20-slim AS deps
# Prisma necesita openssl para sus engines
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiamos solo los manifests para aprovechar la cache de capas.
COPY package.json package-lock.json ./
# prisma/ es necesario porque el postinstall ejecuta "prisma generate".
COPY prisma ./prisma
RUN npm ci


# ---------- Stage 2: builder (genera el build de producción) ----------
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Reutilizamos node_modules ya instalados.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* se hornea en el bundle del cliente en tiempo de build.
# Por defecto vacío => el front usa rutas relativas (/api/...) contra su
# propio backend, que es justo el modo "front servido desde el backend".
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Generamos el cliente de Prisma y compilamos Next.
RUN npx prisma generate
RUN npm run build


# ---------- Stage 3: runner (imagen final que se ejecuta) ----------
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiamos la app ya compilada + dependencias (incluye prisma CLI y tsx,
# necesarios para ejecutar migraciones y el seed al arrancar el contenedor).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Carpetas que se montan como volúmenes (BD SQLite y archivos subidos).
RUN mkdir -p /app/db /app/public/uploads

EXPOSE 3000

# El entrypoint aplica migraciones (y seed opcional) antes de levantar Next.
ENTRYPOINT ["./docker-entrypoint.sh"]
