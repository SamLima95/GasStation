# Análise de Requisitos — GasStation

**Projeto:** GasStation — Plataforma de Governança de Ativos e Conformidade  
**Documento:** Análise de Requisitos  
**Versão:** 1.0  
**Aluno:** Samuel Lima  
**Referências:** EspecificacaoCorporativa.md, RequisitosCorp.md, IdeiaInicial.md

---

## 1. Objetivo e Escopo

### 1.1 Objetivo do documento

Este documento consolida e analisa os requisitos do sistema GasStation, derivados da especificação corporativa, dos requisitos para sistema corporativo e da ideia inicial do projeto, servindo como base para projeto detalhado, desenvolvimento e validação.

### 1.2 Escopo do sistema

O GasStation é uma **plataforma corporativa** para gestão integrada de distribuidoras de gás (pequeno e médio porte), com foco em:

- **Governança de ativos** (vasilhames/botijões como ativos imobilizados).
- **Conformidade regulatória** (ANP, NF-e/NFC-e, auditoria).
- **Operação multi-unidade** (holding com múltiplas filiais/depósitos).

**Dentro do escopo:**

- Vendas e pedidos (comodato, pagamentos, integração NF).
- Estoque e vasilhames (P13, P45, rastreabilidade).
- Logística (rotas, entregas, roteirização).
- Financeiro (caixa, contas a receber, inadimplência, crédito).
- RH/Frota (entregadores, veículos, manutenção, metas).
- Identidade, controle de acesso (RBAC) e auditoria.
- Dashboard com KPIs e relatórios.
- Integração com sistemas externos (NF-e, ANP, roteirização).

**Fora do escopo (premissa):**

- Não substituir sistemas legados de terceiros; integração via API/Webhook.
- Foco em distribuidoras de pequeno e médio porte; não contempla customizações enterprise específicas de cada cliente.

---

## 2. Stakeholders e Usuários

| Stakeholder / Perfil        | Interesse principal |
|-----------------------------|----------------------|
| **Admin Holding**           | Visão consolidada de todas as filiais, regras centrais, compliance. |
| **Gerente de Filial**       | Operação da unidade, estoque, equipe, resultados da filial. |
| **Financeiro**              | Caixa, contas a receber, inadimplência, limites de crédito. |
| **Entregador / Operador**   | Pedidos, rotas, entregas, registro de retornos e avarias. |
| **Compliance / Jurídico**   | Trilhas de auditoria, conformidade ANP, rastreabilidade. |
| **Equipe de TI / Operação** | Integrações, disponibilidade, monitoramento. |

---

## 3. Problema e Contexto

### 3.1 Problemas que o sistema resolve

- **Processos manuais:** substituição de planilhas, papel e anotações desconectadas.
- **Controle operacional:** estoque de vasilhames, rotas, caixa, contas a receber.
- **Rastreabilidade:** ativos (botijões), conformidade ANP e auditoria para fins jurídicos.
- **Visão consolidada:** multi-filial (holding) e interoperabilidade com NF-e, roteirização e sistemas externos.
- **Perdas e erros:** redução de perdas de estoque, falhas em entregas e dificuldade de visualizar lucro real.

### 3.2 Premissas

- Arquitetura em microsserviços com mensageria (RabbitMQ) e processamento assíncrono.
- Uso de banco relacional (PostgreSQL/MySQL) para dados críticos e não relacional (Redis/MongoDB) para cache e desempenho.
- Front-end desacoplado; back-end expõe APIs REST.
- Integração bidirecional com ecossistema externo (NF-e, ANP, roteirização).

---

## 4. Requisitos Funcionais

### 4.1 Identidade e Acesso

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF01 | Cadastro de usuários | Cadastro, edição e exclusão de usuários. |
| RF02 | Perfis e permissões | Controle de perfis e permissões (RBAC). |
| RF03 | Autenticação | Autenticação segura (JWT ou OAuth2). |
| RF04 | Recuperação de senha | Fluxo de recuperação de senha. |
| RF05 | Controle de sessão | Controle de sessão (timeout, revogação). |
| RF06 | Autorização por papel | Papéis: admin holding, gerente filial, entregador, financeiro, etc. |
| RF07 | Permissões por módulo e unidade | Permissões por módulo e por unidade (multi-unidade). |
| RF08 | Logs de acesso | Registro de acessos (quem, quando, de onde). |

### 4.2 Auditoria e Rastreamento

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF09 | Registro de ações | Registro de ações dos usuários. |
| RF10 | Histórico de alterações | Histórico (quem, quando, o quê, unidade). |
| RF11 | Versionamento | Controle de versionamento de dados quando aplicável. |
| RF12 | Trilhas imutáveis | Trilhas de auditoria imutáveis para estoque, financeiro e pedidos. |

### 4.3 Estoque e Vasilhames

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF13 | Controle por tipo | Controle por tipo de botijão (P13, P45, etc.). |
| RF14 | Movimentação | Entrada, saída e retorno de vasilhames. |
| RF15 | Rastreabilidade | Rastreabilidade de vasilhames (ativos). |
| RF16 | Alertas de estoque | Alertas de estoque mínimo e previsão de reposição. |
| RF17 | Consolidação holding | Consolidação de estoques por unidade e em nível macro. |

### 4.4 Vendas e Pedidos

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF18 | Pedidos | Gestão de pedidos (incl. app interno). |
| RF19 | Comodato | Controle de comodato de botijões por cliente. |
| RF20 | Pagamentos | Tipos de pagamento: à vista, fiado, cartão, PIX. |
| RF21 | Integração NF | Integração com NF-e/NFC-e. |

### 4.5 Logística

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF22 | Rotas | Gestão de rotas de entrega. |
| RF23 | Otimização | Otimização por região; integração com roteirização (Maps/Fleet). |
| RF24 | Acompanhamento | Acompanhamento de entregas em tempo real. |

### 4.6 Financeiro

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF25 | Caixa | Controle de caixa. |
| RF26 | Contas a receber | Contas a receber e fluxo de cobrança. |
| RF27 | Inadimplência | Controle de inadimplência. |
| RF28 | Limite de crédito | Limite de crédito por cliente; regras por unidade com override central. |
| RF29 | Consolidação financeira | Consolidação de resultados (faturamento, margem, inadimplência) por unidade e holding. |

### 4.7 RH e Frota

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF30 | Entregadores | Cadastro e gestão de entregadores. |
| RF31 | Veículos | Cadastro e gestão de veículos. |
| RF32 | Manutenção | Controle de manutenção de veículos. |
| RF33 | Metas | Acompanhamento de metas comerciais por entregador. |

### 4.8 Dashboard e Relatórios

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF34 | KPIs estratégicos | Faturamento, margem, ticket médio, giro de estoque, inadimplência, desempenho por entregador. |
| RF35 | Tempo real | Indicadores em tempo real ou quase real-time. |
| RF36 | Filtros | Filtros por período e por unidade (holding/filial). |
| RF37 | Exportação | Exportação de relatórios. |
| RF38 | Atualização dinâmica | Atualização dinâmica (dados eventualmente via processamento assíncrono e cache). |

### 4.9 Holding e Multi-unidade

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF39 | Gestão centralizada | Gestão centralizada de múltiplas filiais e depósitos. |
| RF40 | Regras por unidade | Definição de regras de negócio e limites por unidade, com override central quando aplicável. |

### 4.10 Governança e Compliance

| ID   | Requisito | Descrição |
|------|-----------|-----------|
| RF41 | Perdas e avarias | Registro de perdas e avarias. |
| RF42 | Conformidade ANP | Suporte a padrões e exigências ANP. |
| RF43 | Integração bidirecional | Enviar e receber dados via API ou Webhook, com validação e autenticação. |
| RF44 | Contratos de API | Contratos padronizados, versionamento e documentação (OpenAPI/Swagger). |

---

## 5. Requisitos Não Funcionais

### 5.1 Segurança

| ID    | Requisito | Descrição |
|-------|-----------|-----------|
| RNF01 | Criptografia | Criptografia de dados sensíveis. |
| RNF02 | SQL Injection | Proteção contra SQL Injection. |
| RNF03 | XSS | Proteção contra XSS. |
| RNF04 | Rate limiting | Rate limiting em APIs. |
| RNF05 | Backup | Backup automatizado. |
| RNF06 | LGPD | Compliance com LGPD. |

### 5.2 Performance

| ID    | Requisito | Descrição |
|-------|-----------|-----------|
| RNF07 | Tempo de resposta | Baixo tempo de resposta. |
| RNF08 | Cache | Uso de cache (Redis ou similar) para dashboards e consultas frequentes. |
| RNF09 | Consultas | Otimização de consultas. |
| RNF10 | Assíncrono | Processamento assíncrono para tarefas pesadas (relatórios, NF-e, roteirização). |

### 5.3 Escalabilidade

| ID    | Requisito | Descrição |
|-------|-----------|-----------|
| RNF11 | Escalabilidade horizontal | Suporte a escalabilidade horizontal. |
| RNF12 | Balanceamento | Balanceamento de carga. |
| RNF13 | Desacoplamento | Arquitetura desacoplada (microsserviços, mensageria). |

### 5.4 Disponibilidade

| ID    | Requisito | Descrição |
|-------|-----------|-----------|
| RNF14 | Alta disponibilidade | HA onde aplicável. |
| RNF15 | Monitoramento | Monitoramento com métricas e alertas. |
| RNF16 | Health checks | Health checks nos serviços. |
| RNF17 | Failover | Failover para componentes críticos. |

### 5.5 Interoperabilidade

| ID    | Requisito | Descrição |
|-------|-----------|-----------|
| RNF18 | APIs REST | APIs padronizadas (RESTful), comunicação via JSON. |
| RNF19 | Versionamento | Versionamento de API. |
| RNF20 | Integração externa | Integração bidirecional com sistemas externos (webhooks quando cabível). |

---

## 6. Arquitetura e Subsistemas

Os requisitos corporativos exigem que o sistema seja organizado em **subsistemas (microsserviços)**:

| Subsistema | Responsabilidade principal | Comunicação |
|------------|----------------------------|-------------|
| Vendas/Pedidos | Pedidos, comodato, pagamentos, integração NF | API REST + RabbitMQ |
| Estoque/Vasilhames | Entrada, saída, retorno, rastreabilidade P13/P45 | API REST + RabbitMQ |
| Logística | Rotas, entregas, roteirização (Maps/Fleet) | API REST + RabbitMQ |
| Financeiro | Caixa, contas a receber, inadimplência, limite de crédito | API REST + RabbitMQ |
| RH/Frota | Entregadores, veículos, manutenção, metas | API REST + RabbitMQ |
| Identidade e Auditoria | Usuários, RBAC, trilhas de auditoria imutáveis | API REST (interno) |

Cada microsserviço deve ser **stateless**, ter **API REST própria** e **banco isolado** quando necessário; comunicação entre serviços via **API REST** (síncrona) e **RabbitMQ** (assíncrona, eventos de domínio).

---

## 7. Regras de Negócio (Resumo)

- Estoque mínimo e previsão de reposição com base em histórico de vendas.
- Limite de crédito por cliente; regras por unidade com possibilidade de override central.
- Comodato de botijões registrado por cliente.
- Movimentação de estoque e financeiro deve gerar trilhas de auditoria imutáveis.
- Consolidação de estoques e resultados financeiros por unidade e em nível holding.
- Integração com NF-e/NFC-e, padrões ANP e roteirização externa como requisito de conformidade.

---

## 8. Restrições

- **Tempo:** escopo de ERP/CRM vertical com muitas features; priorização e fases recomendadas.
- **Validação corporativa:** projeto deve contemplar visão holding, microsserviços, interoperabilidade e compliance (RBAC + auditoria).
- **Tecnologias indicadas:** PostgreSQL ou MySQL (relacional), Redis ou MongoDB (não relacional), RabbitMQ, Docker, Kubernetes ou similar, CI/CD com testes automatizados.

---

## 9. Rastreabilidade

Este documento de análise de requisitos está alinhado a:

- **EspecificacaoCorporativa.md** — requisitos corporativos, arquitetura, conformidade.
- **RequisitosCorp.md** — requisitos genéricos para sistema corporativo (funcionais, não funcionais, arquitetura, testes, governança).
- **IdeiaInicial.md** — problema de negócio, diferenciais e ajustes para validação corporativa (holding, subsistemas, interoperabilidade, identidade e auditoria).

---

## 10. Próximos passos sugeridos

1. Detalhar casos de uso (fluxos) por subsistema a partir dos RF listados.
2. Definir priorização (MVP x fases seguintes) considerando tempo e dependências.
3. Especificar contratos de API (OpenAPI) por microsserviço.
4. Detalhar modelo de dados e eventos de domínio para RabbitMQ.
5. Estabelecer critérios de aceite por requisito (RF/RNF) para testes e validação.
