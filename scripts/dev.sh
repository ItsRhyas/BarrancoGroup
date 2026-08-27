#!/usr/bin/env bash
#
# Un solo comando para levantar todo el entorno de desarrollo.
# Idempotente: es seguro ejecutarlo varias veces; cada paso solo
# se hace si hace falta (o si ya está listo, se omite).
#
# Uso: pnpm start
#
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Entorno: crear .env la primera vez
if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Creado .env desde .env.example"
else
  echo "→ .env ya existe"
fi

# 2. Dependencias: instalar la primera vez (o cuando falten)
if [ ! -d node_modules ]; then
  echo "→ Instalando dependencias (pnpm install)..."
  pnpm install
else
  echo "→ Dependencias ya instaladas"
fi

# 3. Cliente Prisma: regenerar (rápido, asegura que el cliente exista)
echo "→ Generando cliente Prisma..."
pnpm db:generate

# 4. Base de datos: levantar PostgreSQL (idempotente con docker compose up -d)
echo "→ Levantando PostgreSQL..."
pnpm docker:dev

# Esperar a que Postgres esté listo (evita que el backend falle en el primer arranque).
echo "→ Esperando a que PostgreSQL esté listo..."
MAX_WAIT=60
ATTEMPTS=0
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-hn26}" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_WAIT" ]; then
    echo "✗ PostgreSQL no respondió tras ${MAX_WAIT}s. Revisá que Docker esté corriendo y que el contenedor haya arrancado."
    exit 1
  fi
  sleep 1
done
echo "→ PostgreSQL listo"

# 5. App: frontend (Vite) + backend (NestJS) en paralelo
echo "→ Arrancando frontend y backend..."
exec pnpm dev
