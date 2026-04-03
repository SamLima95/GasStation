#!/bin/bash
# =============================================================================
# Script de inicializacao do PostgreSQL — GasStation
# Executado automaticamente pelo container Postgres na primeira vez (via
# docker-entrypoint-initdb.d). Cria todos os bancos de dados dos microsservicos.
# =============================================================================

set -e

POSTGRES_USER="${POSTGRES_USER:-lframework}"

echo "==> Criando bancos de dados dos microsservicos..."

# Funcao auxiliar: cria o banco se nao existir
create_db() {
  local db_name="$1"
  echo "    -> Criando banco: $db_name"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE "$db_name" OWNER "$POSTGRES_USER"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db_name')\gexec
EOSQL
}

# ---- Bancos existentes ----
create_db "lframework"
create_db "lframework_identity"

# ---- Fase 1: Stock Service ----
create_db "lframework_stock"

# ---- Fase 2: Order Service ----
create_db "lframework_order"

# ---- Fase 3: Financial Service ----
create_db "lframework_financial"

# ---- Fase 4: Logistics Service ----
create_db "lframework_logistics"

# ---- Fase 6: Audit Service ----
create_db "lframework_audit"

echo "==> Todos os bancos criados com sucesso!"
