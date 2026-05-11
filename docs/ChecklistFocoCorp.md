# Checklist focado — Dashboard, escalabilidade, interoperabilidade, mensageria, async, Docker e testes

Este documento **aprofunda** o que ainda falta implementar ou formalizar nessas frentes, em linha com `docs/RequisitosCorp.md`. Ele não substitui o inventário geral em `docs/ChecklistFaltantesCorp.md`; serve como **guia operacional** para execução e revisão.

---

## Como ler este arquivo

| Coluna mental | Significado |
|---------------|-------------|
| **Estado atual** | O que o código ou o repo já fazem hoje (ponto de partida). |
| **O que falta** | Itens acionáveis; marque `[x]` quando fechados. |
| **Aceite sugerido** | Como saber que o item está realmente concluído. |
| **Onde olhar no repo** | Atalhos para não reinventar caminhos. |

---

## Estado geral do repositório (snapshot)

- **Docker:** não há `Dockerfile` para microsserviços; apenas `docker-compose.yml` sobe Postgres, Redis, RabbitMQ e Nginx (`nginx/nginx.conf`).
- **Dashboard:** consolida KPIs chamando **HTTP** outros serviços (`InternalServiceClientAdapter`), com **cache Redis** e TTL fixo no código (ver secção 1).
- **Mensageria:** exchanges/filas e política de retry centralizadas em `packages/shared/src/rabbitmq.constants.ts`; detalhes operacionais em `docs/Mensageria.md`.
- **Observabilidade:** endpoints `/health`, `/ready` e `/metrics` padronizados em `@lframework/shared`; detalhes em `docs/Observabilidade.md`.
- **Testes:** `dashboard-service` tem unitários em `packages/dashboard-service/tests/unit/` e integração em `packages/dashboard-service/src/__tests__/integration/`.

---

## 1. Dashboard e KPIs

### Objetivo (RequisitosCorp)

Indicadores estratégicos e operacionais, filtros por período, exportação, atualização dinâmica ou quase em tempo real (`docs/RequisitosCorp.md` §2.4).

### Estado atual no repositório

- Rotas HTTP: `GET /api/v1/dashboard`, `GET .../dashboard/export/csv`, `GET .../dashboard/export/pdf` — ver `packages/dashboard-service/src/adapters/driving/http/routes.ts`.
- Agregação: `GetDashboardUseCase` faz `Promise.all` sobre pedidos, movimentações, caixas, contas, rotas e entregas — ver `packages/dashboard-service/src/application/use-cases/get-dashboard.use-case.ts`.
- Cache: **Redis** via `ICacheService`; **TTL atual = 30 segundos** (`CACHE_TTL = 30`), ou seja, “quase tempo real” hoje significa **no máximo ~30s de atraso** por chave de cache, mais latência das chamadas aos outros serviços.
- OpenAPI descreve query params `unidadeId`, `dataInicio`, `dataFim` — `packages/dashboard-service/src/openapi.ts`.

### O que falta

- [x] **Formalizar o modelo de atualização dinâmica**
  - [x] Decidir se 30s de TTL é o **SLA oficial** ou se haverá SSE/WebSocket/polling mais curto no front.
  - [x] Documentar impacto: cada refresh pode gerar **N chamadas HTTP** aos microsserviços (carga sob escala).
- [x] **Documentar SLA / intervalo oficial**
  - [x] Incluir número (ex.: “KPIs refletem dados com até X s de defasagem”) e **exceções** (export pode ser snapshot no momento da requisição).
- [x] **Documentar origem de cada KPI** (matriz recomendada)

  | Bloco no JSON | Origem (serviço + ideia de endpoint/dados) | Observação |
  |---------------|---------------------------------------------|------------|
  | `resumo` | Pedidos agregados via cliente interno | Derivado de `fetchPedidos` |
  | `estoque` | Movimentações | `fetchMovimentacoes` |
  | `financeiro` | Caixas + contas | `fetchCaixas`, `fetchContasAReceber` |
  | `logistica` | Rotas + entregas | `fetchRotas`, `fetchEntregas` |

  Matriz detalhada em `docs/Dashboard.md`, com **URLs base** configuradas em `serviceUrls` e paths reais consumidos pelo adapter.

- [x] **Testes de integração** (supertest + serviços reais ou mocks de HTTP)
  - [x] Cenários com **filtros** `dataInicio`, `dataFim`, `unidadeId` (combinações representativas).
  - [x] Cenários de **exportação** CSV e PDF (status 200, `Content-Type`, tamanho &gt; 0 ou estrutura mínima).
- [ ] **Alinhar com processamento assíncrono** (secção 5 deste doc): se KPIs passarem a ser pré-calculados por jobs, o dashboard deve **ler fonte única** (cache materializado ou serviço de leitura) para não duplicar regras.

### Critérios de aceite sugeridos

- Existe um **documento ou seção no README** do `dashboard-service` com: SLA de frescor, matriz KPI → origem, e diagrama simples (opcional) do fluxo HTTP.
- Testes de integração rodam em CI e cobrem **pelo menos** um caminho feliz com filtros + um export.

### Referências no código

- `packages/dashboard-service/src/application/use-cases/get-dashboard.use-case.ts` — TTL e agregações.
- `packages/dashboard-service/src/adapters/driven/http-client/internal-service-client.adapter.ts` — lista real de chamadas aos outros serviços.

---

## 2. Escalabilidade

### Objetivo (RequisitosCorp)

Escalabilidade horizontal, balanceamento, arquitetura desacoplada (`docs/RequisitosCorp.md` §3.3 e §4).

### Estado atual no repositório

- Gateway **Nginx** no compose repassa para serviços no host (`extra_hosts: host.docker.internal`) — adequado para dev, não é por si só estratégia de produção.
- Serviços Express com **JWT stateless** e sessões persistidas no **identity** (ver identity-service): tende a escalar por réplicas **desde que** Redis/sessão e DB não sejam suposições locais.

### O que falta

- [x] **Documento de escalabilidade por serviço**
  - [x] Quais endpoints são **puramente leitura** vs escrita pesada.
  - [x] Onde **réplicas múltiplas** são seguras sem coordenação extra (ex.: dashboard só leitura com cache Redis compartilhado).
  - [x] Onde há **gargalo** (ex.: identity com sessões — confirmar uso de store compartilhado).
- [x] **Configuração para múltiplas réplicas**
  - [x] Variáveis por instância (`PORT`, `INSTANCE_ID` opcional para logs).
  - [x] Decisão sobre **sticky sessions**: em geral **não necessário** se JWT + refresh estiverem corretos; documentar se algum fluxo exige.
- [x] **Validação stateless**
  - [x] Lista explícita: nenhum consumidor RabbitMQ pode depender só de **Map em memória** para idempotência global em produção (hoje há padrões com contador em memória em alguns consumidores — revisar impacto multi-réplica).
- [x] **Limites de conexão**
  - [x] Prisma: `connection_limit` / pool por serviço (documentar em `.env.example`).
  - [x] Redis e RabbitMQ: máximo de conexões e comportamento sob pico.
- [x] **Balanceamento além do compose**
  - [x] Descrever alvo (Kubernetes Service, ALB, Traefik, etc.) e **health check** esperado pelo balanceador.

### Critérios de aceite sugeridos

- Um único markdown (ex.: `docs/Escalabilidade.md` ou seção no README raiz) que um novo DevOps consiga seguir para subir **2 réplicas** de um serviço sem surpresas.

---

## 3. Interoperabilidade

### Objetivo (RequisitosCorp)

APIs REST/JSON, versionamento, integração bidirecional com externos, webhooks, logs e resiliência (`docs/RequisitosCorp.md` §3.5 e §9).

### Estado atual no repositório

- APIs internas REST + OpenAPI em vários serviços.
- Integrações **externas reais** (NF-e, parceiros) e **webhooks de entrada** não são um módulo único visível como produto fechado — tratam-se de **lacunas de produto**.

### O que falta

- [ ] **NF-e / NFC-e ou adaptador**
  - [ ] Contrato com provedor (certificado, ambiente nacional vs sandbox).
  - [ ] Onde roda (serviço dedicado vs `order-service`), fila para processamento assíncrono.
- [ ] **Logística externa** (se no escopo acadêmico/produto): mesmo padrão — adapter + config.
- [ ] **Webhooks de entrada**
  - [ ] Rotas dedicadas (ex.: `/api/v1/integrations/:provider/webhook`) ou serviço `integration-service` futuro.
  - [ ] Esquema de **verificação** (HMAC com secret por parceiro, timestamp anti-replay).
- [x] **Cliente HTTP resiliente** para chamadas de saída
  - [x] Timeout default, retry com jitter.
  - [ ] Idempotency-key onde aplicável.
  - [x] Biblioteca ou wrapper compartilhado em `packages/shared` (evitar cópias em cada serviço).
- [ ] **Logs de integração**
  - [ ] Campos mínimos: `integration`, `direction` (in/out), `duration_ms`, `status`, `correlation_id`.
- [ ] **Versionamento de contrato externo**
  - [ ] Prefixo `/v1` nas rotas públicas de integração; política de deprecação.

### Critérios de aceite sugeridos

- Pelo menos um fluxo **entrada** (webhook mock) e um **saída** (HTTP mock) cobertos por teste automatizado.
- Runbook: “parceiro retorna 503” — comportamento esperado documentado.

---

## 4. Mensageria (RabbitMQ)

### Objetivo (RequisitosCorp)

Filas, comunicação entre microsserviços, garantias e resiliência (`docs/RequisitosCorp.md` §7).

### Estado atual no repositório

- Constantes de exchanges/filas/DLQ nomeadas em `packages/shared/src/rabbitmq.constants.ts` (ex.: `QUEUE_*_FAILED`).
- Consumidores em **catalog, stock, order, financial, logistics**, identity (publicação/outbox), etc.
- Padrão repetido: `MAX_RETRIES = 5`, header `x-retry-count`, filas `*.failed` — mas **não há um módulo único** que configure política para **todos** os consumidores nem métricas unificadas.

### O que falta

- [x] **Padronização de retry**
  - [x] Extrair constantes compartilhadas (`MAX_RETRIES`, `RETRY_BASE_MS`, nome do header) para **`packages/shared`** e usar nos consumidores.
  - [x] Garantir que **todo consumidor** implemente o mesmo contrato (incluindo serviços que ainda não seguirem o padrão).
- [ ] **Dead-letter “de verdade” vs fila `.failed` manual**
  - [ ] Avaliar uso de **DLX/DLQ nativas** do RabbitMQ vs envio manual para `*.failed` — documentar decisão e comportamento operacional (alertas quando fila `.failed` crescer).
- [ ] **Política por tipo de mensagem**
  - [ ] Tabela: fila → max retries → backoff → destino final (DLQ / descarte / reprocessamento manual).
- [ ] **Métricas**
  - [ ] Profundidade de filas, taxa de ack/nack, tempo médio de processamento (Prometheus ou equivalente).
- [ ] **Testes**
  - [ ] Payload inválido JSON; handler que lança; mensagem que esgota retries e aparece na fila failed.
- [x] **Documentação operacional**
  - [x] Diagrama ou tabela: exchange → routing key → fila → consumidor → serviço.
  - [x] Exemplo de payload versionado (`eventVersion` ou schema semver).

### Critérios de aceite sugeridos

- Nenhum consumidor com `MAX_RETRIES` “solto” sem referência à política documentada.
- Documento único (`docs/Mensageria.md` ou similar) que permita onboard de um dev sem ler todos os `*.consumer.ts`.

### Referências no código

- `packages/shared/src/rabbitmq.constants.ts`
- Exemplo de consumidor: `packages/stock-service/src/adapters/driving/messaging/rabbitmq-user-created.consumer.ts`

---

## 5. Processamento assíncrono

### Objetivo (RequisitosCorp)

Jobs em background, filas, eventos de domínio, retry, DLQ (`docs/RequisitosCorp.md` §8).

### Estado atual no repositório

- Eventos assíncronos via RabbitMQ (criação de usuário, pedido confirmado, etc.).
- **Jobs genéricos** tipo “geração pesada de relatório em worker dedicado” ou **BullMQ** não aparecem como camada única — relatórios do dashboard podem estar **síncronos** na requisição de export (validar `ExportDashboardUseCase`).

### O que falta

- [ ] **Decisão de plataforma de jobs**
  - [ ] Opções: apenas RabbitMQ + workers; **BullMQ** no Redis; ou **PG advisory** para jobs raros.
- [ ] **Lista de tarefas assíncronas**
  - [ ] Export PDF/CSV grandes, envio de e-mail, sincronização batch, recálculo de KPIs materializados.
- [ ] **Retry com backoff** para jobs (alinhado à secção 4 se usar a mesma infra).
- [ ] **Observabilidade de falhas**: log estruturado + opcional persistência de “job morto”.
- [x] **Reprocessamento**: CLI ou endpoint admin com permissão forte para **redrive** da DLQ (com auditoria).
- [ ] **Documentar KPIs assíncronos**: se passarem a ser atualizados por job, frequência e consistência eventual.

### Critérios de aceite sugeridos

- Pelo menos **uma** tarefa claramente **fora do request/response** HTTP documentada ponta a ponta (da API até o worker).

---

## 6. Infraestrutura — Dockerfile por serviço

### Objetivo

Containerização e deploy reproduzível (`docs/RequisitosCorp.md` §10.1).

### Estado atual

- **Sem** `Dockerfile` nos pacotes de aplicação; desenvolvimento típico via `pnpm` no host + infra pelo compose.

### O que falta

Para cada runtime abaixo, criar **Dockerfile** (idealmente **multi-stage**: deps → build → runtime enxuta):

| Pacote | Checklist |
|--------|-----------|
| `packages/identity-service` | [x] |
| `packages/catalog-service` | [x] |
| `packages/order-service` | [x] |
| `packages/stock-service` | [x] |
| `packages/financial-service` | [x] |
| `packages/logistics-service` | [x] |
| `packages/dashboard-service` | [x] |
| `packages/audit-service` | [x] |

Opcional:

| Pacote | Notas |
|--------|--------|
| `packages/dashboard-ui` | Build estático servido por Nginx ou imagem Node conforme o pipeline do front. |
| `packages/shared` | Biblioteca: normalmente **não** imagem própria; entra como dependência no build dos serviços. |

### Detalhes de implementação recomendados

- [x] **Build monorepo**: usar contexto na **raiz** do repo e copiar `pnpm-lock.yaml`, `package.json`, workspaces; comando típico `pnpm deploy` ou filtro `--filter <pkg>`.
- [x] **Imagem final**: distroless ou `node:XX-bookworm-slim`, usuário não-root.
- [x] **Healthcheck**: `curl -f http://localhost:<PORT>/health` ou wget, alinhado a cada serviço.
- [x] **Compose de stack completa**: novo arquivo ex.: `docker-compose.apps.yml` ou perfil no compose atual com **build:** e **depends_on** health dos dados.

### Critérios de aceite sugeridos

- `docker compose build` gera imagens para todos os serviços listados sem erro.
- Um comando documentado sobe **stack mínima** (dados + um microsserviço) para smoke test.

---

## 7. Testes (foco nas áreas deste checklist)

### Estado atual

- Vários serviços têm `src/__tests__/integration/` (ex.: identity, catalog).
- Dashboard: forte em `tests/unit/`; lacuna natural em **integração com Redis + mocks HTTP** ou **wiremock**.

### O que falta

#### Dashboard / KPIs / exportação

- [x] Pasta de integração sugerida: `packages/dashboard-service/src/__tests__/integration/` (alinhar ao padrão dos outros pacotes) **ou** documentar uso exclusivo de `tests/integration`.
- [ ] Casos:
  - [x] `GET /dashboard` com query combinando período e unidade — validar estrutura JSON e que **cache** retorna segunda chamada sem re-chamar mocks (opcional, com Redis test container ou mock de cache).
  - [x] `GET /dashboard/export/csv` e `/pdf` — status, headers, corpo não vazio.

#### Mensageria e assíncrono

- [ ] Expandir testes para **todos** os consumidores críticos (paridade com a política unificada da secção 4).
- [ ] Testes de **contrato de payload** (snapshot ou schema Zod compartilhado para eventos).

#### Escalabilidade / carga

- [ ] Script **k6** ou **Artillery** na pasta `scripts/load/` ou `perf/` com cenário contra gateway.
- [ ] Documentar **meta** inicial (mesmo que conservadora): ex. p95 latência dashboard com X RPS.

#### Interoperabilidade

- [ ] Mock server (MSW em Node, `nock`, ou servidor HTTP de teste) para cliente externo + testes de timeout/retry.
- [ ] Testes de webhook: assinatura válida / inválida.

### Critérios de aceite sugeridos

- CI executa pelo menos: **lint**, **unit**, **integration** nos pacotes alterados; carga pode ser **manual ou nightly** até haver máquina dedicada.

---

## Manutenção deste documento

1. Ao concluir um bloco, marcar checkboxes aqui e **espelhar** o estado relevante em `docs/ChecklistFaltantesCorp.md` para evitar divergência.
2. Se um item for **explicitamente fora de escopo** (ex.: NF-e real só em produto comercial), registrar **decisão** em uma linha sob o item em vez de deixá-lo ambíguo.
