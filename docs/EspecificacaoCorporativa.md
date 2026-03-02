# Especificação Corporativa — Sistema de Gestão para Distribuidora de Gás

**Projeto:** GasStation — Plataforma de Governança de Ativos e Conformidade  
**Aluno:** Samuel Lima  
**Versão:** 1.1

---

## 1. Introdução e Visão Geral

Um sistema corporativo atende necessidades **estratégicas, operacionais e gerenciais** da organização, suportando múltiplos usuários, grandes volumes de dados, integração com outros sistemas e alto nível de confiabilidade.

O GasStation é uma **plataforma corporativa** para gestão integrada de distribuidoras de gás (pequeno e médio porte), evoluindo de uma ferramenta de vendas para um ambiente de **governança de ativos, conformidade regulatória e operação multi-unidade**. Integra vendas, estoque, logística, financeiro, RH/Frota e compliance em uma **arquitetura de microsserviços**, com **mensageria (RabbitMQ)** e **processamento assíncrono**.

### 1.1 Problema que resolve

- Substituição de processos manuais, planilhas e anotações em papel.
- Controle operacional e estratégico: estoque de vasilhames, rotas, caixa, contas a receber.
- Rastreabilidade de ativos (botijões), conformidade ANP e auditoria para fins jurídicos.
- Visão consolidada multi-filial (holding) e interoperabilidade com NF-e, roteirização e sistemas externos.

---

## 2. Requisitos Corporativos (Validação do Projeto)

### 2.1 Visão de Holding (Multi-unidade)

- Gestão **centralizada** de múltiplas filiais e depósitos.
- Consolidação de **estoques de vasilhames** (ativos imobilizados) por unidade e em nível macro.
- Consolidação de **resultados financeiros** (faturamento, margem, inadimplência) por unidade e holding.
- Definição de regras de negócio e limites (crédito, estoque mínimo) por unidade, com override central quando aplicável.

### 2.2 Arquitetura de Subsistemas (Microsserviços)

Os módulos são **microsserviços independentes**, cada um com responsabilidade única, deploy isolado e comunicação via APIs e mensageria:

| Subsistema      | Responsabilidade principal                          | Comunicação |
|-----------------|-----------------------------------------------------|-------------|
| **Vendas/Pedidos** | Pedidos, comodato, tipos de pagamento, integração NF  | API REST + RabbitMQ |
| **Estoque/Vasilhames** | Entrada, saída, retorno, rastreabilidade P13/P45     | API REST + RabbitMQ |
| **Logística**   | Rotas, entregas, integração roteirização (Maps/Fleet)| API REST + RabbitMQ |
| **Financeiro**  | Caixa, contas a receber, inadimplência, limite crédito | API REST + RabbitMQ |
| **RH/Frota**    | Entregadores, veículos, manutenção, metas           | API REST + RabbitMQ |
| **Identidade e Auditoria** | Usuários, RBAC, trilhas de auditoria imutáveis       | API REST (interno) |

### 2.3 Interoperabilidade e Compliance

- **Integração com ecossistema externo:** NF-e/NFC-e, padrões ANP, roteirização (Google Maps/Fleet).
- **Integração bidirecional:** enviar e receber dados via API ou Webhook, com validação e autenticação.
- Contratos de API padronizados, versionamento e documentação (OpenAPI/Swagger).

### 2.4 Gestão de Identidade e Auditoria

- **RBAC** e **trilhas de auditoria imutáveis** para compliance jurídico (detalhes nas seções 3.1 a 3.3).

---

## 3. Requisitos Funcionais

### 3.1 Gestão de Usuários

- Cadastro, edição e exclusão de usuários.
- Controle de perfis e permissões (RBAC).
- Autenticação segura (JWT ou OAuth2).
- Recuperação de senha.
- Controle de sessão.

### 3.2 Controle de Acesso

- Autorização baseada em papéis (admin holding, gerente filial, entregador, financeiro, etc.).
- Permissões por módulo e por unidade (multi-unidade).
- Logs de acesso.

### 3.3 Auditoria e Rastreamento

- Registro de ações dos usuários.
- Histórico de alterações (quem, quando, o quê, unidade).
- Controle de versionamento de dados quando aplicável.
- Trilhas de auditoria imutáveis para movimentação de estoque, financeiro e pedidos.

### 3.4 Dashboard com KPIs

- Visualização de métricas estratégicas (faturamento, margem, ticket médio, giro de estoque, inadimplência, desempenho por entregador).
- Indicadores operacionais em tempo real ou quase real-time.
- Filtros por período e por unidade (holding/filial).
- Exportação de relatórios.
- Atualização dinâmica (real-time ou quase real-time), com dados eventualmente alimentados por processamento assíncrono e cache.

---

## 4. Requisitos Não Funcionais

### 4.1 Segurança

- Criptografia de dados sensíveis.
- Proteção contra SQL Injection e XSS.
- Rate limiting.
- Backup automatizado.
- Compliance com LGPD.

### 4.2 Performance

- Baixo tempo de resposta.
- Uso de cache (Redis ou similar) para dashboards e consultas frequentes.
- Otimização de consultas.
- Processamento assíncrono para tarefas pesadas (relatórios, NF-e, roteirização).

### 4.3 Escalabilidade

- Escalabilidade horizontal.
- Balanceamento de carga.
- Arquitetura desacoplada (microsserviços, mensageria).

### 4.4 Disponibilidade

- Alta disponibilidade (HA) onde aplicável.
- Monitoramento com métricas e alertas.
- Health checks nos serviços.
- Failover para componentes críticos.

### 4.5 Interoperabilidade

- APIs padronizadas (RESTful), comunicação via JSON.
- Versionamento de API.
- Integração bidirecional com sistemas externos (enviar e receber dados, webhooks quando cabível).

---

## 5. Arquitetura Técnica

### 5.1 Microsserviços

- Sistema dividido em **serviços independentes** por domínio (usuários, pedidos, estoque, pagamentos, logística, relatórios, etc.).
- Cada microsserviço deve:
  - Ter **responsabilidade única**.
  - Ser **stateless**.
  - Expor **API REST própria**.
  - Possuir **banco isolado** quando necessário (ou schemas/databases lógicos no relacional).
- Benefícios: escalabilidade independente, deploy isolado, melhor manutenção, maior resiliência.
- Comunicação entre serviços: **API REST** (síncrona) e **RabbitMQ** (assíncrona, eventos de domínio).

### 5.2 Separação Front-end e Back-end

- Front-end **desacoplado** do back-end.
- Back-end expõe **APIs REST** (HTTP/HTTPS, JSON).
- Benefícios: independência tecnológica, escalabilidade separada, reutilização da API para apps mobile ou integrações externas.

### 5.3 Bancos de Dados

- **Banco relacional (PostgreSQL ou MySQL):** dados críticos e estruturados — pedidos, clientes, estoque transacional, financeiro, usuários, auditoria. Integridade referencial e transações ACID.
- **Banco não relacional (MongoDB, Redis ou similar):** alta performance para cache, logs de eventos, armazenamento de documentos/NF-e quando aplicável. Estratégia: relacional para dados críticos; não relacional para performance e escalabilidade.

### 5.4 Mensageria — RabbitMQ

- **RabbitMQ** para:
  - Processamento assíncrono (jobs em background).
  - Comunicação entre microsserviços (eventos de domínio).
  - Filas de tarefas (emissão NF-e, relatórios, notificações).
  - Garantia de entrega de mensagens.
- Benefícios: desacoplamento, escalabilidade, resiliência (mensagens persistem em falhas), processamento distribuído.

### 5.5 Processamento Assíncrono

- Jobs em background, filas de processamento e eventos de domínio.
- **Retry automático** e **dead-letter queues** para mensagens que falham após tentativas.
- Exemplos no GasStation: geração de relatórios, envio de e-mails/notificações, processamento de pagamentos, emissão de NF-e, atualização de KPIs e cache do dashboard.

### 5.6 Integrações Externas

- **Integração bidirecional:** enviar dados para sistemas externos (Sefaz, roteirização, ANP) e receber via API ou Webhook.
- Validar dados recebidos; garantir autenticação nas integrações.
- **Requisitos:** logs de integração, tratamento de falhas, timeout e retry, versionamento de integração.
- Casos de uso: NF-e/NFC-e, roteirização (Google Maps/Fleet), conformidade ANP.

---

## 6. Infraestrutura

### 6.1 Containerização

- **Docker** para isolamento e empacotamento dos serviços.

### 6.2 Orquestração

- **Kubernetes ou similar** para orquestração, com auto scaling quando necessário.

### 6.3 CI/CD

- Pipeline automatizado (build, testes, deploy).
- Testes automatizados no pipeline.
- Deploy seguro (ambientes, rollback).

---

## 7. Testes

- Testes **unitários**.
- Testes de **integração**.
- Testes de **carga**.
- Testes de **segurança**.
- Testes de **contrato** (para microsserviços, garantindo compatibilidade entre consumidores e provedores de API).

---

## 8. Governança

- Controle de versão (Git).
- Code review obrigatório.
- Documentação técnica atualizada (APIs, arquitetura).
- Monitoramento contínuo (métricas, alertas).
- Política de segurança da informação.

---

## 9. Funcionalidades por Área (Resumo de Negócio)

- **Estoque:** controle por tipo (P13, P45), entrada/saída/retorno, rastreabilidade, alertas de mínimo e previsão de reposição.
- **Vendas/Pedidos:** pedidos (app interno), comodato por cliente, pagamento (à vista, fiado, cartão, PIX), integração com NF.
- **Logística:** rotas otimizadas por região, acompanhamento em tempo real, integração com roteirização externa.
- **Financeiro:** caixa, contas a receber, inadimplência, limite de crédito por cliente.
- **RH/Frota:** entregadores, veículos, manutenção, metas comerciais.
- **Governança:** auditoria completa, perdas e avarias, visão holding, RBAC e trilhas de auditoria.

---

## 10. Resumo de Conformidade

| Requisito | Atendimento |
|-----------|-------------|
| **Validação do projeto** | |
| Visão Holding (multi-unidade) | Sim |
| Arquitetura de subsistemas (microsserviços) | Sim |
| Interoperabilidade e compliance (NF-e, ANP, roteirização) | Sim |
| Gestão de identidade e auditoria (RBAC + trilhas) | Sim |
| **Requisitos funcionais** | |
| Gestão de usuários (cadastro, JWT/OAuth2, recuperação de senha, sessão) | Sim |
| Controle de acesso (RBAC, permissões por módulo, logs de acesso) | Sim |
| Auditoria e rastreamento (ações, histórico, versionamento) | Sim |
| Dashboard com KPIs (métricas, tempo real, filtros, exportação, atualização dinâmica) | Sim |
| **Requisitos não funcionais** | |
| Segurança (criptografia, SQL/XSS, rate limiting, backup, LGPD) | Sim |
| Performance (cache Redis, otimização, processamento assíncrono) | Sim |
| Escalabilidade (horizontal, balanceamento, desacoplamento) | Sim |
| Disponibilidade (HA, monitoramento, health checks, failover) | Sim |
| Interoperabilidade (REST, JSON, versionamento, integração bidirecional) | Sim |
| **Arquitetura** | |
| Microsserviços (stateless, API própria, banco isolado quando necessário) | Sim |
| Back-end e front-end separados, API RESTful | Sim |
| 1 banco relacional + 1 não relacional | Sim |
| RabbitMQ (mensageria, filas, garantia de entrega) | Sim |
| Processamento assíncrono (retry, dead-letter) | Sim |
| Integração bidirecional (logs, timeout, retry, versionamento) | Sim |
| **Infraestrutura e qualidade** | |
| Docker (containerização) | Sim |
| Kubernetes ou similar (orquestração, auto scaling) | Sim |
| CI/CD (pipeline, testes automatizados, deploy seguro) | Sim |
| Testes (unitários, integração, carga, segurança, contrato) | Sim |
| Governança (Git, code review, documentação, monitoramento, política de segurança) | Sim |

---

*Documento alinhado à Ideia Inicial, ao feedback do professor e ao documento RequisitosCorp.md (requisitos para sistema corporativo).*
