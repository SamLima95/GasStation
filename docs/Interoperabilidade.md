# Interoperabilidade

Este documento registra o estado atual de interoperabilidade do GasStation.

## Decisão de escopo

Integrações externas reais ficam para uma etapa posterior.

Fora do escopo imediato:

- NF-e/NFC-e com provedor real;
- webhooks externos de parceiros;
- integração real com roteirização externa;
- credenciais, certificados e homologação com provedores.

## Base implementada

Foi criado um cliente HTTP resiliente compartilhado em:

```text
packages/shared/src/http/resilient-http-client.ts
```

Funcionalidades:

| Recurso | Estado |
|---------|--------|
| Timeout por request | Implementado. |
| Retry em erro de rede/timeout | Implementado. |
| Retry em status transitórios | Implementado para `408`, `429`, `500`, `502`, `503`, `504`. |
| Backoff exponencial | Implementado. |
| Jitter | Implementado. |
| Logs estruturados de falha | Implementado com `logger.warn`. |
| Idempotency-key | Não implementado; deve ser adicionado quando houver operações externas com escrita. |

## Uso atual

O `dashboard-service` usa `ResilientHttpClient` para consultar serviços internos:

- `order-service`;
- `stock-service`;
- `financial-service`;
- `logistics-service`.

O comportamento funcional do dashboard permanece o mesmo: se uma chamada interna falhar, o adapter registra log e retorna lista vazia para aquela origem.

## Próximos passos futuros

Quando integrações externas entrarem no escopo:

1. Definir contrato de cada provedor.
2. Adicionar `idempotency-key` para operações de escrita quando aplicável.
3. Persistir logs de integração com `integration`, `direction`, `duration_ms`, `status` e `correlation_id`.
4. Criar testes com provedor mock para timeout, retry e respostas `503`.
5. Criar autenticação de webhooks com HMAC, timestamp e proteção anti-replay.
