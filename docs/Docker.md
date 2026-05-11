# Docker

Este documento descreve a containerização dos microsserviços do GasStation.

## Imagens de aplicação

Cada serviço Node tem um `Dockerfile` próprio:

| Serviço | Dockerfile | Porta |
|---------|------------|-------|
| `identity-service` | `packages/identity-service/Dockerfile` | `3001` |
| `catalog-service` | `packages/catalog-service/Dockerfile` | `3002` |
| `stock-service` | `packages/stock-service/Dockerfile` | `3004` |
| `order-service` | `packages/order-service/Dockerfile` | `3005` |
| `financial-service` | `packages/financial-service/Dockerfile` | `3006` |
| `logistics-service` | `packages/logistics-service/Dockerfile` | `3007` |
| `audit-service` | `packages/audit-service/Dockerfile` | `3008` |
| `dashboard-service` | `packages/dashboard-service/Dockerfile` | `3009` |

Os Dockerfiles usam contexto na raiz do monorepo, `pnpm --filter <service>... run build` e `pnpm deploy --prod` para gerar uma pasta runtime com dependências de produção e pacotes workspace resolvidos.

## Build

Build de todas as imagens:

```bash
pnpm docker:build:apps
```

Build de uma imagem:

```bash
docker compose -f docker-compose.yml -f docker-compose.apps.yml build dashboard-service
```

## Subir stack com apps

```bash
pnpm docker:up:apps
```

Esse comando combina:

- `docker-compose.yml`: PostgreSQL, Redis, RabbitMQ e Nginx;
- `docker-compose.apps.yml`: microsserviços de aplicação e override do Nginx para rotear para containers.

Gateway:

```text
http://localhost:8080/health
```

Exemplos de health checks:

```bash
curl http://localhost:8080/identity/health
curl http://localhost:8080/catalog/health
curl http://localhost:8080/dashboard/health
```

## Migrações

As imagens não executam migrações automaticamente no entrypoint. Antes de usar endpoints que dependem de tabelas, execute as migrações do ambiente:

```bash
pnpm migrate:all
```

Em produção, a etapa de migração deve ser um job separado do deploy da aplicação.

## Variáveis

O `docker-compose.apps.yml` define valores locais para smoke test. Em ambientes reais, substituir pelo mecanismo de configuração do orquestrador.

| Variável | Uso |
|----------|-----|
| `JWT_SECRET` | Deve ser igual em todas as réplicas. |
| `*_DATABASE_URL` | URL do banco do serviço, idealmente com `connection_limit`. |
| `REDIS_URL` | Redis compartilhado para cache/autenticação. |
| `RABBITMQ_URL` | RabbitMQ compartilhado para eventos. |
| `*_SERVICE_PORT` | Porta interna do serviço. |
| `BASE_URL` | URL pública usada por OpenAPI e redirects quando aplicável. |

## Healthcheck

Cada imagem de serviço inclui `HEALTHCHECK` chamando `GET /health` na porta interna do serviço para liveness. Para readiness de balanceador/orquestrador, use `GET /ready`, que valida PostgreSQL e Redis quando essas dependências existem no serviço. Métricas HTTP ficam em `GET /metrics`.
