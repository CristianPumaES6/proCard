#!/bin/sh
# ============================================================================
#  Entrypoint del contenedor proCard
#  1. Asegura las carpetas persistentes (BD y uploads)
#  2. Sincroniza el esquema de Prisma sobre la BD SQLite (db push)
#  3. (Opcional) Ejecuta el seed si RUN_SEED=true
#  4. Levanta el servidor de Next.js (sirve front + APIs)
# ============================================================================
set -e

echo "==> proCard: preparando carpetas persistentes..."
mkdir -p /app/db /app/public/uploads

# Se usa "db push" en lugar de "migrate deploy" porque las migraciones del
# repositorio están desactualizadas respecto a schema.prisma. "db push" deja
# la BD idéntica al esquema actual (que es lo que espera el Prisma Client).
# Es idempotente: si la BD ya coincide, no hace nada.
echo "==> proCard: sincronizando el esquema de la base de datos (db push)..."
npx prisma db push --skip-generate

if [ "$RUN_SEED" = "true" ]; then
  echo "==> proCard: ejecutando seed de datos de ejemplo..."
  npx prisma db seed || echo "!! Seed falló o ya estaba aplicado, se continúa."
fi

echo "==> proCard: iniciando servidor Next.js en el puerto ${PORT:-3000}..."
exec npx next start -p "${PORT:-3000}"
