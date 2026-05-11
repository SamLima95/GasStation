# Observabilidade operacional

Este documento define o contrato operacional mínimo dos microsserviços HTTP.

## Endpoints padronizados

Todos os serviços Express registram os endpoints abaixo via `@lframework/shared`:

| Endpoint | Uso | Status esperado |
|----------|-----|-----------------|
| `GET /health` | Liveness: valida se o processo HTTP está respondendo. | `200` com `{ "status": "ok", "service": "..." }` |
| `GET /ready` | Readiness: valida se o serviço pode receber tráfego. | `200` quando pronto; `503` se alguma checagem falhar. |
| `GET /metrics` | Métricas em texto compatível com Prometheus. | `200` com `text/plain; version=0.0.4`. |

Os endpoints operacionais são ignorados pelo rate limit para evitar falso positivo em probes.

## Métricas disponíveis

O middleware compartilhado registra métricas por método, rota e status HTTP:

| Métrica | Tipo | Significado |
|---------|------|-------------|
| `app_info{service="..."}` | gauge | Identidade do serviço exposto. |
| `process_uptime_seconds` | gauge | Tempo de vida do processo Node.js. |
| `http_requests_total{method,route,status_code}` | counter | Total de respostas HTTP emitidas. |
| `http_request_duration_seconds_sum{method,route,status_code}` | counter | Soma das durações das respostas HTTP. |

Essa base permite configurar gráficos de taxa de erro, tráfego e latência média:

```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
sum(rate(http_request_duration_seconds_sum[5m])) / sum(rate(http_requests_total[5m]))
```

Observação: a métrica de duração atual expõe soma agregada, não histograma por percentil. Para p95/p99 em produção, o próximo passo é adicionar buckets Prometheus ou OpenTelemetry.

## Readiness

O contrato de readiness aceita checagens assíncronas por serviço. No estado atual, os serviços registram automaticamente checagens de PostgreSQL e Redis quando essas dependências existem no container da aplicação. Falha em qualquer checagem retorna `503`.

Próximas checagens recomendadas por serviço:

| Serviço | Checagens recomendadas |
|---------|------------------------|
| `identity-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ/outbox. |
| `catalog-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ consumer. |
| `stock-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ consumer. |
| `order-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ publisher/consumer. |
| `financial-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ consumer. |
| `logistics-service` | Implementado: PostgreSQL, Redis. Recomendado: RabbitMQ consumer. |
| `dashboard-service` | Implementado: Redis. Recomendado: disponibilidade mínima dos serviços internos. |
| `audit-service` | Implementado: PostgreSQL. Recomendado: RabbitMQ consumer. |

## Logs

Os serviços já usam `requestIdMiddleware` e `requestLoggingMiddleware`, gerando logs estruturados com:

- `requestId`
- `method`
- `path`
- `statusCode`
- `durationMs`

Esse conjunto é suficiente para correlacionar erro HTTP, latência e eventos internos no mesmo request.

## Alertas sugeridos

Alertas mínimos para produção:

- Erro HTTP 5xx acima de 1% por 5 minutos.
- `/ready` retornando `503` por mais de 1 minuto.
- Uptime reiniciando repetidamente no mesmo serviço.
- Latência média acima da meta definida por endpoint.
- Filas RabbitMQ `.failed` com crescimento contínuo.

## Arquivos relacionados

- `packages/shared/src/http/observability.ts`
- `packages/shared/src/http/health.ts`
- `packages/*-service/src/app.ts`
