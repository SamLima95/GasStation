#!/bin/bash
# =============================================================================
# Sobe os containers Docker (Postgres, Redis, RabbitMQ, Nginx) e inicia
# todos os microsservicos. Se alguma porta ja estiver ocupada, troca
# automaticamente para a proxima livre e atualiza o .env.
# =============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# Carrega .env
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# ---------- helpers ----------------------------------------------------------

# Checa se uma porta esta em uso
port_in_use() {
  ss -tlnH "sport = :$1" 2>/dev/null | grep -q ":$1 " && return 0
  return 1
}

# Encontra a proxima porta livre a partir de $1
find_free_port() {
  local port=$1
  while port_in_use "$port"; do
    echo "  Porta $port ocupada, tentando $((port + 1))..." >&2
    port=$((port + 1))
  done
  echo "$port"
}

# Atualiza uma variavel no .env (KEY=valor)
update_env() {
  local key=$1 val=$2
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  fi
}

# ---------- resolve portas ---------------------------------------------------

echo "==> Verificando portas dos containers..."

POSTGRES_PORT="${POSTGRES_PORT:-5435}"
REDIS_PORT="${REDIS_PORT:-6381}"
RABBITMQ_PORT="${RABBITMQ_PORT:-5675}"
RABBITMQ_MANAGEMENT_PORT="${RABBITMQ_MANAGEMENT_PORT:-15675}"
GATEWAY_PORT="${GATEWAY_PORT:-8082}"

# Verifica se os nossos proprios containers ja estao rodando nessas portas
# Se sim, nao precisamos trocar
is_our_container() {
  local container_name=$1
  local port=$2
  docker ps --filter "name=$container_name" --filter "publish=$port" --format '{{.Names}}' 2>/dev/null | grep -q "$container_name"
}

resolve_port() {
  local var_name=$1
  local current_port=$2
  local container_name=$3

  if is_our_container "$container_name" "$current_port"; then
    echo "$current_port"
  else
    find_free_port "$current_port"
  fi
}

NEW_POSTGRES_PORT=$(resolve_port POSTGRES_PORT "$POSTGRES_PORT" "lframework-postgres")
NEW_REDIS_PORT=$(resolve_port REDIS_PORT "$REDIS_PORT" "lframework-redis")
NEW_RABBITMQ_PORT=$(resolve_port RABBITMQ_PORT "$RABBITMQ_PORT" "lframework-rabbitmq")
NEW_RABBITMQ_MGMT_PORT=$(resolve_port RABBITMQ_MANAGEMENT_PORT "$RABBITMQ_MANAGEMENT_PORT" "lframework-rabbitmq")
NEW_GATEWAY_PORT=$(resolve_port GATEWAY_PORT "$GATEWAY_PORT" "lframework-nginx")

# ---------- atualiza .env se necessario --------------------------------------

CHANGED=false

if [ "$NEW_POSTGRES_PORT" != "$POSTGRES_PORT" ]; then
  echo "  Postgres: $POSTGRES_PORT -> $NEW_POSTGRES_PORT"
  update_env "POSTGRES_PORT" "$NEW_POSTGRES_PORT"
  # Atualiza todas as connection strings
  sed -i "s|localhost:${POSTGRES_PORT}|localhost:${NEW_POSTGRES_PORT}|g" "$ENV_FILE"
  POSTGRES_PORT=$NEW_POSTGRES_PORT
  CHANGED=true
fi

if [ "$NEW_REDIS_PORT" != "$REDIS_PORT" ]; then
  echo "  Redis: $REDIS_PORT -> $NEW_REDIS_PORT"
  update_env "REDIS_PORT" "$NEW_REDIS_PORT"
  update_env "REDIS_URL" "redis://localhost:${NEW_REDIS_PORT}"
  REDIS_PORT=$NEW_REDIS_PORT
  CHANGED=true
fi

if [ "$NEW_RABBITMQ_PORT" != "$RABBITMQ_PORT" ]; then
  echo "  RabbitMQ: $RABBITMQ_PORT -> $NEW_RABBITMQ_PORT"
  update_env "RABBITMQ_PORT" "$NEW_RABBITMQ_PORT"
  update_env "RABBITMQ_URL" "amqp://lframework:lframework@localhost:${NEW_RABBITMQ_PORT}"
  RABBITMQ_PORT=$NEW_RABBITMQ_PORT
  CHANGED=true
fi

if [ "$NEW_RABBITMQ_MGMT_PORT" != "$RABBITMQ_MANAGEMENT_PORT" ]; then
  echo "  RabbitMQ Management: $RABBITMQ_MANAGEMENT_PORT -> $NEW_RABBITMQ_MGMT_PORT"
  update_env "RABBITMQ_MANAGEMENT_PORT" "$NEW_RABBITMQ_MGMT_PORT"
  RABBITMQ_MANAGEMENT_PORT=$NEW_RABBITMQ_MGMT_PORT
  CHANGED=true
fi

if [ "$NEW_GATEWAY_PORT" != "$GATEWAY_PORT" ]; then
  echo "  Nginx Gateway: $GATEWAY_PORT -> $NEW_GATEWAY_PORT"
  update_env "GATEWAY_PORT" "$NEW_GATEWAY_PORT"
  GATEWAY_PORT=$NEW_GATEWAY_PORT
  CHANGED=true
fi

if [ "$CHANGED" = true ]; then
  echo "  .env atualizado com novas portas."
  # Recarrega
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "  Todas as portas livres. OK."
fi

# ---------- sobe containers --------------------------------------------------

echo ""
echo "==> Subindo containers Docker..."
cd "$ROOT_DIR"
docker compose up -d

# Aguarda health checks basicos
echo ""
echo "==> Aguardando containers ficarem prontos..."

wait_for_port() {
  local port=$1 name=$2 retries=30
  while ! ss -tlnH "sport = :$port" 2>/dev/null | grep -q ":$port "; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      echo "  AVISO: $name na porta $port nao respondeu a tempo."
      return 1
    fi
    sleep 1
  done
  echo "  $name pronto (porta $port)"
}

wait_for_rabbitmq() {
  local retries=40
  echo "  Aguardando RabbitMQ aceitar conexoes AMQP (porta $RABBITMQ_PORT)..."
  while ! docker exec lframework-rabbitmq rabbitmq-diagnostics ping >/dev/null 2>&1; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      echo "  AVISO: RabbitMQ nao ficou pronto a tempo."
      return 1
    fi
    sleep 1
  done
  echo "  RabbitMQ pronto (porta $RABBITMQ_PORT)"
}

wait_for_port "$POSTGRES_PORT" "PostgreSQL" &
wait_for_port "$REDIS_PORT" "Redis" &
wait_for_rabbitmq &
wait

# ---------- inicia servicos --------------------------------------------------

echo ""
echo "==> Iniciando microsservicos..."
cd "$ROOT_DIR"

pnpm run dev:identity &
pnpm run dev:catalog &
pnpm run dev:stock &
pnpm run dev:order &
pnpm run dev:financial &
pnpm run dev:logistics &
pnpm run dev:audit &
pnpm run dev:dashboard &
pnpm run dev:api-docs &
pnpm run dev:dashboard-ui &

wait
