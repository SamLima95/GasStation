# Mensageria RabbitMQ

Este documento registra o contrato operacional atual dos eventos RabbitMQ do GasStation.

## Política de retry

A política compartilhada fica em `packages/shared/src/rabbitmq.constants.ts`:

| Constante | Valor | Uso |
|-----------|-------|-----|
| `RABBITMQ_MAX_RETRIES` | `5` | Número máximo de falhas antes da fila `.failed`. |
| `RABBITMQ_RETRY_BASE_MS` | `2000` | Base do backoff exponencial em milissegundos. |
| `RABBITMQ_RETRY_HEADER` | `x-retry-count` | Header usado para carregar a tentativa atual. |

O delay é calculado como `RABBITMQ_RETRY_BASE_MS * 2 ** (retry - 1)`.

Ao esgotar as tentativas, o consumidor envia a mensagem para a fila `.failed` correspondente e confirma descarte da mensagem original sem requeue.

## Fluxos atuais

| Exchange | Routing key | Fila | Consumidor | Destino de falha |
|----------|-------------|------|------------|------------------|
| `user.events` | `user_created` | `catalog.user_created` | `catalog-service` | `catalog.user_created.failed` |
| `user.events` | `user_created` | `stock.user_created` | `stock-service` | `stock.user_created.failed` |
| `user.events` | `user_created` | `order.user_created` | `order-service` | `order.user_created.failed` |
| `user.events` | `user_created` | `financial.user_created` | `financial-service` | `financial.user_created.failed` |
| `user.events` | `user_created` | `logistics.user_created` | `logistics-service` | `logistics.user_created.failed` |
| `order.events` | `order_confirmed` | `financial.order_confirmed` | `financial-service` | `financial.order_confirmed.failed` |
| `order.events` | `order_confirmed` | `logistics.order_confirmed` | `logistics-service` | `logistics.order_confirmed.failed` |
| `audit.events` | `audit_logged` | `audit.logged` | `audit-service` | `audit.logged.failed` |

## Payloads

Os eventos devem usar envelope versionável:

```json
{
  "type": "user_created",
  "payload": {
    "userId": "uuid-ou-id",
    "email": "usuario@example.com",
    "name": "Nome do usuário",
    "occurredAt": "2026-05-11T12:00:00.000Z"
  }
}
```

Campos recomendados para evolução:

| Campo | Obrigatório hoje | Observação |
|-------|------------------|------------|
| `type` | Sim | Deve bater com a routing key/evento esperado pelo consumidor. |
| `payload` | Sim | Validado com Zod em cada consumidor. |
| `eventVersion` | Não | Recomendado para versionamento sem quebrar consumidores. |
| `correlationId` | Não | Recomendado para rastrear fluxo entre serviços. |

## Operação

- Monitorar crescimento das filas `.failed`.
- Reprocessamento manual deve preservar o payload original e incrementar auditoria operacional.
- Consumidores não devem criar `MAX_RETRIES`, `RETRY_BASE_MS` ou `x-retry-count` locais; use sempre as constantes compartilhadas.

## Redrive

Mensagens em filas `.failed` podem ser reprocessadas com:

```bash
pnpm rabbitmq:redrive -- --queue catalog.user_created.failed --limit 10
```

Para simular sem mover mensagens:

```bash
pnpm rabbitmq:redrive -- --queue catalog.user_created.failed --dry-run
```

Para percorrer todas as filas `.failed` conhecidas:

```bash
pnpm rabbitmq:redrive -- --all --limit 100
```

O script move a mensagem da fila `.failed` diretamente para a fila original do mesmo serviço. Ele não republica no exchange, evitando duplicar eventos para outros consumidores que não falharam.

Durante o redrive:

- o header `x-retry-count` é removido;
- `x-redrive-count` é incrementado;
- `x-redriven-at` recebe o timestamp do reprocessamento.
