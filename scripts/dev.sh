#!/usr/bin/env bash
#
# One-command startup for the development environment.
# Idempotent: safe to run multiple times; each step is skipped when already done.
#
# Usage: pnpm dev:startup
#
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Environment: create .env on first run
if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Created .env from .env.example"
else
  echo "→ .env already exists"
fi

# 2. Dependencies: install on first run (or when missing)
if [ ! -d node_modules ]; then
  echo "→ Installing dependencies (pnpm install)..."
  pnpm install
else
  echo "→ Dependencies already installed"
fi

# 3. Prisma client: regenerate (fast, ensures the client exists)
echo "→ Generating Prisma client..."
pnpm db:generate

# 4. Start db (Docker) + wait for it + run apps on host (hybrid)
exec node scripts/ensure-db.mjs
