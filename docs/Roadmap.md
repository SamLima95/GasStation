# Roadmap de Implementacao — GasStation

**Projeto:** GasStation — Plataforma de Governanca de Ativos e Conformidade  
**Documento:** Roadmap de Implementacao  
**Versao:** 1.0  
**Aluno:** Samuel Lima  
**Referencias:** AnaliseRequisitos.md, RegrasNegocio.md, EspecificacaoCorporativa.md, DER-GasStation

---

## 1. Visao Geral

O desenvolvimento segue uma ordem baseada em **dependencia entre dominios**: servicos fundamentais primeiro, servicos que dependem deles depois. Cada fase produz um microsservico funcional com schema Prisma, migrations, domain, use cases, controllers e testes.

**Base ja existente:**

- `identity-service` — autenticacao, usuarios, OAuth, JWT, RBAC basico
- `catalog-service` — CRUD generico (serve como template de estrutura)
- `shared` — DTOs, schemas, helpers, eventos
- Infraestrutura — Docker Compose (Postgres, Redis, RabbitMQ), Nginx gateway
- Documentacao completa — DER, BPMN, diagramas, regras de negocio, requisitos

---

## 2. Fases de Implementacao

### Fase 1 — Stock Service (Estoque e Vasilhames)

**Prioridade:** Critica — base de todo o negocio  
**Pacote:** `packages/stock-service`

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Vasilhame` | Tipos de botijao (P13, P45, etc.), capacidade, descricao |
| `MovimentacaoEstoque` | Entrada, saida, retorno, avaria — com rastreabilidade |
| `Comodato` | Saldo de vasilhames emprestados por cliente/unidade |

#### Etapas

1. Criar pacote `stock-service` (copiar estrutura do `catalog-service`)
2. Definir `schema.prisma` com tabelas: `vasilhames`, `movimentacoes_estoque`, `comodatos`
3. Rodar migration inicial
4. Domain layer: entities (`Vasilhame`, `MovimentacaoEstoque`, `Comodato`), value objects, types
5. Application layer: ports (repositories), use cases, DTOs, errors
6. Infrastructure layer: Prisma repositories, controllers, routes, validations
7. Eventos RabbitMQ: `stock.movement.created`, `stock.low-level.alert`
8. Testes unitarios e de integracao
9. Registrar rota `/stock/` no Nginx gateway

#### Regras de negocio cobertas

- RN01 (tipos de vasilhame), RN02 (movimentacao obrigatoria), RN03 (estoque minimo)
- RN04 (previsao de reposicao), RN05 (rastreabilidade), RN06 (consolidacao)
- RN07 (perdas e avarias), RN13-RN15 (comodato)

#### Requisitos funcionais cobertos

- RF13, RF14, RF15, RF16, RF17, RF19, RF41

---

### Fase 2 — Order Service (Vendas e Pedidos)

**Prioridade:** Alta — depende do estoque para validar disponibilidade  
**Pacote:** `packages/order-service`

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Cliente` | Cadastro, documento, limite de credito, saldo devedor |
| `Pedido` | Pedido vinculado a cliente e unidade, status, valor total |
| `ItemPedido` | Itens do pedido com vasilhame, quantidade e preco |

#### Etapas

1. Criar pacote `order-service`
2. `schema.prisma`: `clientes`, `pedidos`, `itens_pedido`
3. Migration
4. Domain layer: entities, value objects (`Status`, `FormaPagamento`)
5. Application layer: use cases (criar pedido, listar, atualizar status, cancelar)
6. Comunicacao com `stock-service` via RabbitMQ: consumir `stock.movement.created`, publicar `order.created`, `order.confirmed`
7. Validacao de estoque: checar disponibilidade antes de confirmar pedido
8. Testes unitarios e de integracao
9. Registrar rota `/orders/` no Nginx gateway

#### Regras de negocio cobertas

- RN08 (pedido vinculado a unidade), RN09 (disponibilidade para venda)
- RN10 (tipos de pagamento), RN11 (fiado e limite de credito)
- RN12 (emissao de NF — interface/port previsto, integracao futura)

#### Requisitos funcionais cobertos

- RF18, RF19, RF20, RF21

---

### Fase 3 — Financial Service (Financeiro)

**Prioridade:** Alta — depende de pedidos para gerar movimentacao financeira  
**Pacote:** `packages/financial-service`

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Caixa` | Abertura/fechamento de caixa por unidade |
| `ContaAReceber` | Divida de cliente por pedido, status, vencimento |

#### Etapas

1. Criar pacote `financial-service`
2. `schema.prisma`: `caixas`, `contas_a_receber`
3. Migration
4. Domain layer: entities, value objects (`StatusConta`, `FormaPagamento`)
5. Application layer: use cases (abrir/fechar caixa, registrar recebimento, consultar inadimplencia)
6. Consumir eventos: `order.confirmed` para gerar conta a receber automaticamente
7. Publicar eventos: `payment.received`, `customer.defaulted`
8. Regras de limite de credito e inadimplencia
9. Testes unitarios e de integracao
10. Registrar rota `/financial/` no Nginx gateway

#### Regras de negocio cobertas

- RN16 (limite de credito), RN17 (limite por unidade e override)
- RN18 (inadimplencia), RN19 (caixa e contas a receber), RN20 (consolidacao)

#### Requisitos funcionais cobertos

- RF25, RF26, RF27, RF28, RF29

---

### Fase 4 — Logistics Service (Logistica)

**Prioridade:** Media — depende de pedidos para montar rotas  
**Pacote:** `packages/logistics-service`

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Entregador` | Cadastro vinculado a unidade |
| `Veiculo` | Placa, modelo, status, unidade |
| `Rota` | Rota planejada por unidade e entregador |
| `Entrega` | Entrega vinculada a rota e pedido |

#### Etapas

1. Criar pacote `logistics-service`
2. `schema.prisma`: `entregadores`, `veiculos`, `rotas`, `entregas`
3. Migration
4. Domain layer: entities, value objects (`StatusRota`, `StatusEntrega`)
5. Application layer: use cases (criar rota, adicionar entregas, confirmar entrega, registrar retorno)
6. Consumir eventos: `order.confirmed` para enfileirar entregas pendentes
7. Publicar eventos: `delivery.confirmed` (dispara atualizacao de estoque e financeiro)
8. Port para integracao com roteirizacao externa (Google Maps/Fleet) — implementacao futura
9. Testes unitarios e de integracao
10. Registrar rota `/logistics/` no Nginx gateway

#### Regras de negocio cobertas

- RN21 (rota vinculada a unidade), RN22 (otimizacao por regiao)
- RN23 (entrega e movimentacao), RN24 (retorno de vasilhames)
- RN25 (entregador vinculado a unidade), RN26 (veiculo e manutencao)

#### Requisitos funcionais cobertos

- RF22, RF23, RF24, RF30, RF31, RF32, RF33

---

### Fase 5 — Holding e Multi-unidade

**Prioridade:** Media — transversal a todos os servicos  
**Onde:** Extensao do `identity-service` + modulo no `shared`

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Unidade` | Filial ou deposito (nome, tipo, status) |
| `UsuarioUnidade` | Vinculo usuario-unidade com nivel de acesso |
| `ConfiguracaoUnidade` | Parametros de negocio por unidade (chave-valor) |

#### Etapas

1. Adicionar tabelas `unidades`, `usuario_unidade`, `configuracao_unidade` ao schema do `identity-service`
2. Migration
3. Implementar RBAC granular por unidade (middleware de contexto de unidade)
4. Filtros por unidade em todos os servicos existentes (stock, order, financial, logistics)
5. Consolidacao holding: endpoints de agregacao cross-unidade com permissoes
6. Testes de permissao e isolamento entre unidades
7. Refatorar servicos anteriores para receber `unidade_id` em todas as operacoes

#### Regras de negocio cobertas

- RN28 (unidade e filial), RN29 (regras por unidade), RN30 (permissoes por unidade)

#### Requisitos funcionais cobertos

- RF02, RF06, RF07, RF39, RF40

---

### Fase 6 — Auditoria e Compliance

**Prioridade:** Media-Alta — necessario para validacao corporativa  
**Onde:** Modulo transversal no `shared` + tabela em cada servico ou servico dedicado

#### Entidades

| Entidade | Descricao |
|----------|-----------|
| `Auditoria` | Registro imutavel: entidade, acao, usuario, unidade, data, alteracao |

#### Etapas

1. Criar modulo de auditoria no `shared` (interceptor/middleware reutilizavel)
2. Definir tabela `auditoria` (pode ser centralizada ou por servico)
3. Interceptar acoes criticas: movimentacao estoque, pedidos, financeiro, alteracoes de cadastro
4. Garantir imutabilidade (append-only, sem UPDATE/DELETE na tabela)
5. Endpoints de consulta de trilha de auditoria com filtros
6. Testes de integridade e imutabilidade

#### Regras de negocio cobertas

- RN31 (trilhas imutaveis), RN32 (conformidade ANP), RN34 (acoes de usuario)

#### Requisitos funcionais cobertos

- RF09, RF10, RF11, RF12, RF42

---

### Fase 7 — Integracoes Externas

**Prioridade:** Baixa (pode ser implementada como ports/interfaces primeiro)

#### 7.1 NF-e / NFC-e

- Criar port `InvoiceEmitter` no `order-service`
- Implementar adapter para API de emissao fiscal
- Tratamento de falhas com retry e registro em auditoria
- **Regras:** RN12, RN33 | **RF:** RF21, RF43

#### 7.2 ANP (Regulatorio)

- Rastreabilidade de vasilhames ja coberta pelo `stock-service`
- Gerar relatorios em formato exigido pela ANP
- **Regras:** RN32 | **RF:** RF42

#### 7.3 Roteirizacao (Google Maps / Fleet)

- Criar port `RouteOptimizer` no `logistics-service`
- Implementar adapter para Google Maps Directions/Fleet API
- **Regras:** RN22 | **RF:** RF23

#### 7.4 Contratos de API

- Documentar todos os endpoints com OpenAPI/Swagger (ja existe base no `api-docs`)
- Versionamento de API
- **RF:** RF43, RF44

---

### Fase 8 — Dashboard e Relatorios

**Prioridade:** Baixa — depende de dados dos servicos anteriores  
**Onde:** Novo servico `packages/dashboard-service` ou modulo agregador

#### Etapas

1. Definir KPIs: faturamento diario, margem por tipo de gas, ticket medio, giro de estoque, inadimplencia, desempenho por entregador
2. Criar endpoints de agregacao que consultam dados dos outros servicos (via API ou views materializadas)
3. Cache com Redis para consultas frequentes
4. Filtros por periodo e por unidade (filial/holding)
5. Exportacao de relatorios (CSV/PDF)
6. Atualizacao dinamica (WebSocket ou polling com cache)

#### Regras de negocio cobertas

- RN06 (consolidacao estoque), RN20 (consolidacao financeira), RN27 (metas)

#### Requisitos funcionais cobertos

- RF34, RF35, RF36, RF37, RF38

---

## 3. Fluxo de Eventos entre Servicos

```
identity-service
  └─ user.created ──────────────> [todos os servicos que replicam usuario]

stock-service
  ├─ stock.movement.created ───> order-service (validacao)
  └─ stock.low-level.alert ────> dashboard-service (alerta)

order-service
  ├─ order.created ────────────> logistics-service (enfileirar entrega)
  └─ order.confirmed ─────────> financial-service (gerar conta a receber)
                                 stock-service (baixar estoque)

financial-service
  ├─ payment.received ─────────> dashboard-service (atualizar KPIs)
  └─ customer.defaulted ──────> order-service (bloquear vendas a prazo)

logistics-service
  └─ delivery.confirmed ──────> stock-service (retorno de vazios)
                                 financial-service (confirmar recebimento)
```

---

## 4. Para cada Fase — Checklist Padrao

Ao iniciar cada microsservico, seguir este checklist:

- [ ] Criar pacote em `packages/<nome>-service`
- [ ] Copiar estrutura base do `catalog-service`
- [ ] Configurar `package.json`, `tsconfig.json`, `vitest.config.ts`
- [ ] Definir `schema.prisma` com as entidades da fase
- [ ] Rodar `prisma migrate dev --name init`
- [ ] Adicionar `DATABASE_URL` no `.env.example` e `docker-compose.yml`
- [ ] Implementar domain layer (entities, value objects, types)
- [ ] Implementar application layer (ports, use cases, DTOs, errors)
- [ ] Implementar infrastructure layer (Prisma repositories, controllers, routes)
- [ ] Configurar eventos RabbitMQ (publishers e consumers)
- [ ] Escrever testes unitarios (use cases, DTOs)
- [ ] Escrever testes de integracao
- [ ] Documentar endpoints com OpenAPI
- [ ] Registrar rota no Nginx gateway (`nginx/nginx.conf`)
- [ ] Adicionar script de dev no `package.json` raiz

---

## 5. Resumo da Rastreabilidade

| Fase | Servico | Regras de Negocio | Requisitos Funcionais |
|------|---------|-------------------|-----------------------|
| 1 | stock-service | RN01-RN07, RN13-RN15 | RF13-RF17, RF19, RF41 |
| 2 | order-service | RN08-RN12 | RF18-RF21 |
| 3 | financial-service | RN16-RN20 | RF25-RF29 |
| 4 | logistics-service | RN21-RN26 | RF22-RF24, RF30-RF33 |
| 5 | holding (identity ext.) | RN28-RN30 | RF02, RF06, RF07, RF39, RF40 |
| 6 | auditoria | RN31-RN34 | RF09-RF12, RF42 |
| 7 | integracoes externas | RN12, RN22, RN32, RN33 | RF21, RF23, RF42-RF44 |
| 8 | dashboard | RN06, RN20, RN27 | RF34-RF38 |
