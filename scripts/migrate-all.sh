#!/bin/bash
# =============================================================================
# Roda as migrations de TODOS os microsservicos (Prisma).
# Uso: ./scripts/migrate-all.sh
#
# Pre-requisito: Docker rodando (pnpm docker:up) e .env configurado.
# =============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PRISMA_BIN="$ROOT_DIR/node_modules/.pnpm/node_modules/.bin/prisma"

if [ ! -f "$PRISMA_BIN" ]; then
  echo "Prisma nao encontrado. Rode 'pnpm install' primeiro."
  exit 1
fi

echo "==> Rodando migrations de todos os servicos..."
echo ""

# Identity Service
echo "--- identity-service ---"
cd "$ROOT_DIR/packages/identity-service"
$PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
echo ""

# Catalog Service
echo "--- catalog-service ---"
cd "$ROOT_DIR/packages/catalog-service"
$PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
echo ""

# Stock Service
echo "--- stock-service ---"
cd "$ROOT_DIR/packages/stock-service"
$PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
echo ""

# ---- Fases futuras (descomentar conforme implementar) ----

# echo "--- order-service ---"
# cd "$ROOT_DIR/packages/order-service"
# $PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
# echo ""

# echo "--- financial-service ---"
# cd "$ROOT_DIR/packages/financial-service"
# $PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
# echo ""

# echo "--- logistics-service ---"
# cd "$ROOT_DIR/packages/logistics-service"
# $PRISMA_BIN migrate deploy --schema=./prisma/schema.prisma
# echo ""

echo "==> Todas as migrations aplicadas com sucesso!"
