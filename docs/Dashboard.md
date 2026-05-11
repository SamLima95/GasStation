# Dashboard e KPIs

Este documento formaliza o modelo atual do `dashboard-service`: agregação HTTP sob demanda, cache Redis e exportação síncrona.

## SLA de atualização

O dashboard usa cache por combinação de `unidadeId`, `dataInicio` e `dataFim`.

| Item | Valor atual |
|------|-------------|
| Frescor dos KPIs | Até 30 segundos de defasagem por chave de cache. |
| Fonte do SLA | `CACHE_TTL = 30` em `packages/dashboard-service/src/application/use-cases/get-dashboard.use-case.ts`. |
| Export CSV/PDF | Snapshot calculado pela mesma leitura do dashboard; pode reutilizar cache vigente. |
| Atualização em tempo real | Não há SSE/WebSocket hoje. O modelo oficial atual é refresh HTTP/polling pelo cliente. |

Na prática, "quase em tempo real" significa que a primeira chamada após expirar o cache consulta os microsserviços e grava novo snapshot por 30 segundos.

## Fluxo

1. Cliente chama `GET /api/v1/dashboard` ou rota de export.
2. `dashboard-service` monta chave `dashboard:{unidadeId}:{dataInicio}:{dataFim}`.
3. Se houver cache Redis, retorna o snapshot.
4. Se não houver cache, consulta os serviços internos em paralelo usando `ResilientHttpClient`.
5. Agrega os KPIs, grava cache com TTL de 30 segundos e retorna a resposta.

Cada cache miss gera até 6 chamadas HTTP internas:

| Serviço | Variável de URL | Default local |
|---------|-----------------|---------------|
| Pedidos | `ORDER_SERVICE_URL` | `http://localhost:3005` |
| Estoque | `STOCK_SERVICE_URL` | `http://localhost:3004` |
| Financeiro | `FINANCIAL_SERVICE_URL` | `http://localhost:3006` |
| Logística | `LOGISTICS_SERVICE_URL` | `http://localhost:3007` |

## Matriz KPI -> Origem

| Bloco | Métrica | Serviço | Endpoint |
|-------|---------|---------|----------|
| `resumo` | `totalPedidos` | `order-service` | `GET /api/v1/pedidos` |
| `resumo` | `pedidosConfirmados` | `order-service` | `GET /api/v1/pedidos` |
| `resumo` | `pedidosPendentes` | `order-service` | `GET /api/v1/pedidos` |
| `resumo` | `pedidosCancelados` | `order-service` | `GET /api/v1/pedidos` |
| `resumo` | `faturamentoTotal` | `order-service` | `GET /api/v1/pedidos` |
| `resumo` | `ticketMedio` | `order-service` | `GET /api/v1/pedidos` |
| `estoque` | `totalMovimentacoes` | `stock-service` | `GET /api/v1/movimentacoes` |
| `estoque` | `entradas` | `stock-service` | `GET /api/v1/movimentacoes` |
| `estoque` | `saidas` | `stock-service` | `GET /api/v1/movimentacoes` |
| `estoque` | `retornos` | `stock-service` | `GET /api/v1/movimentacoes` |
| `estoque` | `avarias` | `stock-service` | `GET /api/v1/movimentacoes` |
| `financeiro` | `caixasAbertos` | `financial-service` | `GET /api/v1/caixas` |
| `financeiro` | `caixasFechados` | `financial-service` | `GET /api/v1/caixas` |
| `financeiro` | `contasPendentes` | `financial-service` | `GET /api/v1/contas-a-receber` |
| `financeiro` | `contasPagas` | `financial-service` | `GET /api/v1/contas-a-receber` |
| `financeiro` | `contasVencidas` | `financial-service` | `GET /api/v1/contas-a-receber` |
| `financeiro` | `valorTotalAberto` | `financial-service` | `GET /api/v1/contas-a-receber` |
| `logistica` | `totalRotas` | `logistics-service` | `GET /api/v1/rotas` |
| `logistica` | `rotasPlanejadas` | `logistics-service` | `GET /api/v1/rotas` |
| `logistica` | `rotasEmAndamento` | `logistics-service` | `GET /api/v1/rotas` |
| `logistica` | `rotasFinalizadas` | `logistics-service` | `GET /api/v1/rotas` |
| `logistica` | `totalEntregas` | `logistics-service` | `GET /api/v1/entregas` |
| `logistica` | `entregasEntregues` | `logistics-service` | `GET /api/v1/entregas` |
| `logistica` | `entregasPendentes` | `logistics-service` | `GET /api/v1/entregas` |

Todos os endpoints internos recebem, quando presentes, os filtros `unidadeId`, `dataInicio` e `dataFim`.

## Exportação

As rotas de exportação são:

| Rota | Formato | Observação |
|------|---------|------------|
| `GET /api/v1/dashboard/export/csv` | CSV | Retorna `text/csv; charset=utf-8`. |
| `GET /api/v1/dashboard/export/pdf` | PDF | Retorna `application/pdf`. |

As exportações usam o mesmo `GetDashboardUseCase`, portanto seguem o mesmo SLA de cache do dashboard.

## Testes

A suíte de integração fica em `packages/dashboard-service/src/__tests__/integration/`.

Executar:

```bash
pnpm --filter dashboard-service run test:integration
```

Cobertura atual:

- dashboard com `unidadeId`, `dataInicio` e `dataFim`;
- cache hit na segunda chamada com o mesmo filtro;
- export CSV com headers e conteúdo mínimo;
- export PDF com headers e corpo não vazio.
