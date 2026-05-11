# Escalabilidade

Este documento registra a estratégia atual para escalar os serviços do GasStation e as restrições que precisam ser respeitadas em produção.

## Modelo atual

O `docker-compose.yml` atual sobe apenas infraestrutura: PostgreSQL, Redis, RabbitMQ e Nginx. O Nginx aponta para serviços rodando no host via `host.docker.internal`, portanto é adequado para desenvolvimento local, não para escalonamento de produção.

Para produção, o alvo recomendado é um orquestrador com service discovery e balanceamento, por exemplo Kubernetes Service, ECS/ALB ou Traefik. Cada instância de aplicação expõe `/health`, `/ready` e `/metrics`, e recebe configuração por variáveis de ambiente.

## Portas e dependências

| Serviço | Porta padrão | Banco | Redis | RabbitMQ | Observação |
|---------|--------------|-------|-------|----------|------------|
| `identity-service` | `3001` | `IDENTITY_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Mantém sessões no banco e blacklist/cache no Redis. |
| `catalog-service` | `3002` | `CATALOG_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Cache Redis e consumidor `user_created`. |
| `stock-service` | `3004` | `STOCK_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Cache Redis e consumidor `user_created`. |
| `order-service` | `3005` | `ORDER_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Publica eventos de pedido e consome `user_created`. |
| `financial-service` | `3006` | `FINANCIAL_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Consome `user_created` e `order_confirmed`. |
| `logistics-service` | `3007` | `LOGISTICS_DATABASE_URL` | `REDIS_URL` | `RABBITMQ_URL` | Consome `user_created` e `order_confirmed`. |
| `audit-service` | `3008` | `AUDIT_DATABASE_URL` | Não obrigatório | `RABBITMQ_URL` | Consome eventos de auditoria. |
| `dashboard-service` | `3009` | Não usa banco próprio | `REDIS_URL` | Não usa | Agrega dados por HTTP e usa cache compartilhado. |

## Réplicas por serviço

| Serviço | Pode ter múltiplas réplicas? | Cuidados |
|---------|-------------------------------|----------|
| `identity-service` | Sim | Sessões são persistidas em banco; usar o mesmo `JWT_SECRET`, `REDIS_URL` e `IDENTITY_DATABASE_URL` em todas as réplicas. |
| `catalog-service` | Sim | Cache Redis compartilhado. Consumidor RabbitMQ pode rodar em múltiplas réplicas, desde que handlers sejam idempotentes. |
| `stock-service` | Sim | Mesmo cuidado de idempotência no consumidor e Redis compartilhado. |
| `order-service` | Sim | Escritas dependem de transações no banco. Publicação de eventos deve manter outbox/idempotência quando o fluxo exigir garantia forte. |
| `financial-service` | Sim | Eventos `order_confirmed` podem ser distribuídos entre réplicas; regras financeiras precisam ser idempotentes por `pedidoId`. |
| `logistics-service` | Sim | Eventos `order_confirmed` podem ser distribuídos entre réplicas; criação de entregas/rotas precisa evitar duplicidade por `pedidoId`. |
| `audit-service` | Sim | Eventos de auditoria podem ser distribuídos entre réplicas; persistência deve tolerar reentrega. |
| `dashboard-service` | Sim | É leitura/agregação; usar Redis compartilhado para cache consistente entre réplicas. |

## Stateless e estado temporário

As APIs HTTP devem ser tratadas como stateless. Não usar memória local como fonte de verdade para autenticação, sessão, cache funcional ou idempotência global.

Estado persistente permitido:

| Tipo | Local esperado |
|------|----------------|
| Dados transacionais | PostgreSQL do serviço. |
| Sessões/refresh tokens | Banco do `identity-service`. |
| Blacklist/cache de autenticação | Redis compartilhado. |
| Cache de leitura | Redis compartilhado. |
| Eventos e retry operacional | RabbitMQ. |

Estado local tolerado:

| Uso local | Risco | Regra |
|-----------|-------|-------|
| Timers de backoff em consumidores | Réplica pode cair antes do republish. | Aceitável no estado atual, mas produção deve preferir DLQ/delay nativo RabbitMQ ou retry persistente. |
| LRU em memória para contador auxiliar de retry | Não é idempotência global. | Não usar para decidir efeitos de negócio; o header `x-retry-count` é o contrato compartilhado. |
| Variáveis em processo | Divergem entre réplicas. | Só para configuração imutável da instância. |

## Sticky sessions

Sticky session não é necessária no modelo atual.

Motivos:

- Access token é JWT.
- Refresh token é persistido no banco do `identity-service`.
- Blacklist/cache usa Redis compartilhado.

Se algum fluxo futuro guardar estado de sessão somente em memória, ele deve ser corrigido antes de habilitar múltiplas réplicas.

## Limites de conexão

Cada réplica abre suas próprias conexões para PostgreSQL, Redis e RabbitMQ. Ao escalar horizontalmente, o limite total cresce aproximadamente como `réplicas * conexões por réplica`.

Política recomendada:

| Dependência | Configuração recomendada |
|-------------|--------------------------|
| PostgreSQL/Prisma | Definir `connection_limit` na `DATABASE_URL` de cada serviço quando houver múltiplas réplicas. |
| Redis | Monitorar `connected_clients`; evitar criar clientes por request. O projeto usa cliente singleton por container Awilix. |
| RabbitMQ | Monitorar conexões, canais e profundidade das filas; consumidores devem usar prefetch quando houver alta carga. |

Exemplo de URL Prisma com limite:

```text
postgresql://user:pass@host:5432/db?connection_limit=5
```

## Balanceamento e health check

O balanceador deve chamar:

```text
GET /ready
```

`/ready` valida dependências registradas no container da aplicação, como PostgreSQL e Redis. `/health` continua disponível como liveness simples para validar que o processo HTTP está vivo.

Alvo recomendado:

| Ambiente | Estratégia |
|----------|------------|
| Desenvolvimento | `docker-compose.yml` atual + serviços via `pnpm run dev`. |
| Homologação | Compose com imagens dos apps ou Traefik/Nginx apontando para containers. |
| Produção | Kubernetes Service, ECS/ALB ou equivalente, com readiness/liveness e autoscaling. |

## Gargalos conhecidos

| Área | Gargalo |
|------|---------|
| Dashboard | Cache miss dispara até 6 chamadas HTTP internas; ver `docs/Dashboard.md`. |
| Identity | Login/refresh dependem do banco e Redis. |
| RabbitMQ | Filas `.failed` e profundidade de filas ainda não têm métricas automatizadas. |
| Prisma | Pool não está documentado em `.env.example`; configurar antes de subir muitas réplicas. |
| Health checks | `/ready` valida PostgreSQL/Redis quando disponíveis; RabbitMQ ainda precisa de checagem dedicada. |

## Checklist para subir 2 réplicas

1. Garantir que as duas réplicas usam as mesmas variáveis de ambiente sensíveis: `JWT_SECRET`, URLs de banco, Redis e RabbitMQ.
2. Configurar `connection_limit` nas URLs Prisma conforme capacidade do PostgreSQL.
3. Usar Redis compartilhado para cache e autenticação.
4. Usar RabbitMQ compartilhado para eventos.
5. Garantir que o balanceador aponta para as duas réplicas e chama `/ready`.
6. Verificar logs com `requestId` para rastrear requisições entre réplicas.
7. Monitorar banco, Redis, RabbitMQ e latência p95 antes de aumentar réplicas.
