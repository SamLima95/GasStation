#!/usr/bin/env bash
# Restore dos bancos PostgreSQL do GasStation.
# Uso:
#   BACKUP_DIR=backups/postgres/20260509-120000 bash scripts/restore-postgres.sh
#
# Atencao: este script restaura sobre os bancos existentes com --clean --if-exists.

set -euo pipefail

POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-lframework}"
BACKUP_DIR="${BACKUP_DIR:-}"

if [[ -z "$BACKUP_DIR" ]]; then
  echo "Erro: informe BACKUP_DIR com o diretorio do backup." >&2
  exit 1
fi

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "Erro: diretorio de backup nao encontrado: $BACKUP_DIR" >&2
  exit 1
fi

DATABASES=(
  "lframework"
  "lframework_identity"
  "lframework_stock"
  "lframework_order"
  "lframework_financial"
  "lframework_logistics"
  "lframework_audit"
)

echo "==> Restaurando backups PostgreSQL de: $BACKUP_DIR"

for database in "${DATABASES[@]}"; do
  input_file="$BACKUP_DIR/$database.dump"
  if [[ ! -f "$input_file" ]]; then
    echo "Erro: arquivo de backup nao encontrado: $input_file" >&2
    exit 1
  fi

  echo "    -> $database"
  docker compose exec -T "$POSTGRES_SERVICE" \
    pg_restore -U "$POSTGRES_USER" -d "$database" --clean --if-exists --no-owner --no-acl \
    < "$input_file"
done

echo "==> Restore concluido."
