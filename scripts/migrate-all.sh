#!/bin/bash
# =============================================================================
# Roda as migrations de TODOS os microsservicos (Prisma).
# Uso: ./scripts/migrate-all.sh
#
# Pre-requisito: Docker rodando (pnpm docker:up) e .env configurado.
# =============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Carrega variaveis de ambiente do .env
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi
PRISMA_BIN="$ROOT_DIR/node_modules/.pnpm/node_modules/.bin/prisma"

if [ ! -f "$PRISMA_BIN" ]; then
  # Fallback: tentar encontrar via npx
  PRISMA_BIN="$(command -v prisma 2>/dev/null || echo "")"
fi

if [ -z "$PRISMA_BIN" ] || [ ! -f "$PRISMA_BIN" ]; then
  echo "Prisma nao encontrado. Rode 'pnpm install' primeiro."
  exit 1
fi

echo "==> Rodando migrations de todos os servicos..."
echo ""

# Identity Service
echo "--- identity-service ---"
cd "$ROOT_DIR/packages/identity-service"
"$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
echo ""

# Catalog Service
echo "--- catalog-service ---"
cd "$ROOT_DIR/packages/catalog-service"
"$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
echo ""

# Stock Service
echo "--- stock-service ---"
cd "$ROOT_DIR/packages/stock-service"
"$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
echo ""

# ---- Fases futuras (descomentar conforme implementar) ----

# echo "--- order-service ---"
# cd "$ROOT_DIR/packages/order-service"
# "$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
# echo ""

# echo "--- financial-service ---"
# cd "$ROOT_DIR/packages/financial-service"
# "$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
# echo ""

# echo "--- logistics-service ---"
# cd "$ROOT_DIR/packages/logistics-service"
# "$PRISMA_BIN" migrate deploy --schema=./prisma/schema.prisma
# echo ""

echo "==> Todas as migrations aplicadas com sucesso!"
