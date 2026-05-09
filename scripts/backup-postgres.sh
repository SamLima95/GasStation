#!/usr/bin/env bash
# Backup dos bancos PostgreSQL do GasStation.
# Uso:
#   bash scripts/backup-postgres.sh
#   BACKUP_DIR=backups/postgres/manual-001 bash scripts/backup-postgres.sh

set -euo pipefail

POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-lframework}"
BACKUP_DIR="${BACKUP_DIR:-backups/postgres/$(date +%Y%m%d-%H%M%S)}"

DATABASES=(
  "lframework"
  "lframework_identity"
  "lframework_stock"
  "lframework_order"
  "lframework_financial"
  "lframework_logistics"
  "lframework_audit"
)

mkdir -p "$BACKUP_DIR"

echo "==> Criando backups PostgreSQL em: $BACKUP_DIR"

for database in "${DATABASES[@]}"; do
  output_file="$BACKUP_DIR/$database.dump"
  echo "    -> $database"
  docker compose exec -T "$POSTGRES_SERVICE" \
    pg_dump -U "$POSTGRES_USER" -d "$database" -F c --no-owner --no-acl \
    > "$output_file"
done

cat > "$BACKUP_DIR/manifest.txt" <<EOF
created_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
postgres_service=$POSTGRES_SERVICE
postgres_user=$POSTGRES_USER
databases=${DATABASES[*]}
format=pg_dump custom (-F c)
EOF

echo "==> Backup concluido."
