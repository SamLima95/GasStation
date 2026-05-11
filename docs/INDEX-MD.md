# Índice da documentação (.md)

Todos os arquivos com estrutura Markdown do projeto **GasStation**.

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| [EspecificacaoCorporativa.md](./EspecificacaoCorporativa.md) | Especificação corporativa do sistema — visão geral, requisitos, arquitetura de microsserviços, interoperabilidade e compliance. |
| [RequisitosCorp.md](./RequisitosCorp.md) | Requisitos para sistema corporativo: funcionais (usuários, acesso, auditoria, dashboard), não funcionais (segurança, desempenho, etc.). |
| [IdeiaInicial.md](./IdeiaInicial.md) | Ideia inicial do projeto — sistema de gestão para distribuidora de gás, diferenciais e feedback do professor. |
| [AnaliseRequisitos.md](./AnaliseRequisitos.md) | Análise de requisitos — consolidação de RF/RNF, stakeholders, escopo, rastreabilidade e próximos passos. |
| [RegrasNegocio.md](./RegrasNegocio.md) | Regras de negócio — RN01–RN34 por área (estoque, vendas, comodato, financeiro, logística, RH/frota, holding, compliance). |
| [BackupRestore.md](./BackupRestore.md) | Rotina de backup e restore dos bancos PostgreSQL. |
| [CI-CD.md](./CI-CD.md) | Pipeline GitHub Actions para lint, build, testes e validação do compose Docker. |
| [Dashboard.md](./Dashboard.md) | SLA, origem dos KPIs, fluxo HTTP/cache e testes do dashboard. |
| [Docker.md](./Docker.md) | Dockerfiles, compose de apps, build de imagens e smoke test local. |
| [Escalabilidade.md](./Escalabilidade.md) | Estratégia de réplicas, stateless, balanceamento, health checks e limites de conexão. |
| [Interoperabilidade.md](./Interoperabilidade.md) | Escopo de integrações externas e cliente HTTP resiliente compartilhado. |
| [Mensageria.md](./Mensageria.md) | Contrato operacional RabbitMQ: retry, filas, exchanges, payloads e filas de falha. |
| [Observabilidade.md](./Observabilidade.md) | Endpoints `/health`, `/ready`, `/metrics`, métricas HTTP e alertas operacionais sugeridos. |

---

## Estrutura resumida

### EspecificacaoCorporativa.md
- Introdução e visão geral
- Requisitos corporativos (holding, microsserviços, compliance)
- Arquitetura e tecnologias
- Casos de uso e integrações

### RequisitosCorp.md
- Requisitos funcionais (gestão de usuários, RBAC, auditoria, dashboard)
- Requisitos não funcionais (segurança, desempenho, escalabilidade)

### IdeiaInicial.md
- Proposta do sistema de venda/gestão de gás
- Diferenciais e escopo
- Feedback e ajustes para validação corporativa

### AnaliseRequisitos.md
- Objetivo, escopo, stakeholders e problema
- Requisitos funcionais (RF01–RF44) por área
- Requisitos não funcionais (RNF01–RNF20)
- Arquitetura/subsistemas, regras de negócio, restrições
- Rastreabilidade e próximos passos

### RegrasNegocio.md
- Convenções (RN, Quando, Então, Exceção)
- Estoque e vasilhames (RN01–RN07)
- Vendas e pedidos (RN08–RN12), comodato (RN13–RN15)
- Financeiro e crédito (RN16–RN20), logística (RN21–RN24)
- RH e frota (RN25–RN27), holding (RN28–RN30), compliance (RN31–RN34)
- Resumo por área e rastreabilidade

### Mensageria.md
- Política compartilhada de retry e backoff
- Tabela exchange, routing key, fila, consumidor e destino de falha
- Exemplo de payload e campos recomendados para versionamento

### Dashboard.md
- SLA de atualização dos KPIs e comportamento de cache
- Matriz KPI, serviço de origem e endpoint consumido
- Rotas de exportação e testes de integração

### CI-CD.md
- Workflow GitHub Actions
- Etapas de lint, build e testes
- Validação do compose de apps

### Docker.md
- Dockerfile por microsserviço
- Compose de apps combinado com a infraestrutura local
- Comandos de build, subida e smoke test

### Escalabilidade.md
- Réplicas por serviço e dependências compartilhadas
- Validação stateless, sticky sessions e limites de conexão
- Balanceamento, health checks e checklist para subir 2 réplicas

### Interoperabilidade.md
- Decisão de adiar integrações externas reais
- Cliente HTTP resiliente compartilhado
- Próximos passos para NF-e, webhooks e provedores mockados

### Observabilidade.md
- Contrato operacional dos endpoints de saúde, readiness e métricas
- Métricas HTTP expostas em formato compatível com Prometheus
- Checagens recomendadas de dependências críticas e alertas mínimos
