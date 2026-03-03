# Regras de Negócio — GasStation

**Projeto:** GasStation — Plataforma de Governança de Ativos e Conformidade  
**Documento:** Regras de Negócio  
**Versão:** 1.0  
**Aluno:** Samuel Lima  
**Referências:** EspecificacaoCorporativa.md, AnaliseRequisitos.md, IdeiaInicial.md

---

## 1. Objetivo do documento

Este documento consolida as **regras de negócio** do sistema GasStation — condições, restrições e critérios que governam o comportamento do sistema em cada área (estoque, vendas, financeiro, logística, holding, compliance). Serve como referência para análise, desenvolvimento e testes.

---

## 2. Convenções

- **RN** = Regra de Negócio (identificador único).
- **Quando** descreve o contexto ou evento que dispara a regra.
- **Então** descreve o resultado ou ação esperada.
- **Exceção** indica situações em que a regra pode ser flexibilizada ou não se aplica.

---

## 3. Estoque e Vasilhames

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN01** | Tipos de vasilhame | O sistema controla estoque de botijões. | Cada item é classificado por tipo (ex.: P13, P45). Estoque é mantido por tipo e por unidade (filial/depósito). | Novos tipos podem ser parametrizados pela holding. |
| **RN02** | Movimentação obrigatória | Ocorre entrada, saída ou retorno de vasilhames. | Toda movimentação deve ser registrada (quantidade, tipo, unidade, data, responsável). Não é permitido alterar saldo sem movimentação. | Ajustes de inventário seguem fluxo de auditoria específico. |
| **RN03** | Estoque mínimo | O estoque de um tipo na unidade atinge ou fica abaixo do estoque mínimo configurado. | O sistema gera alerta de estoque mínimo para a unidade. O alerta pode ser consolidado em nível holding. | Estoque mínimo é parametrizável por unidade; a holding pode definir override. |
| **RN04** | Previsão de reposição | É necessária decisão de reposição. | A previsão de reposição é calculada com base no histórico de vendas/entregas da unidade (e período configurável). | Período e fórmula podem ser parametrizados por unidade ou centralmente. |
| **RN05** | Rastreabilidade de ativos | Vasilhames são tratados como ativos imobilizados. | Entrada, saída e retorno devem permitir rastreabilidade (origem/destino, cliente quando aplicável) para conformidade e auditoria. | Nível de rastreabilidade (por unidade lote vs. por item) pode ser configurável. |
| **RN06** | Consolidação de estoque | A holding ou gerente consulta estoque. | O sistema consolida estoques por unidade e em nível macro (soma das filiais), respeitando permissões por unidade. | Unidades inativas podem ser excluídas da consolidação. |
| **RN07** | Perdas e avarias | Ocorre perda ou avaria de vasilhame. | O registro de perda/avaria é obrigatório, com motivo e responsável, e impacta o estoque e a trilha de auditoria. | — |

---

## 4. Vendas e Pedidos

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN08** | Pedido vinculado à unidade | Um pedido é criado. | O pedido fica vinculado a uma unidade (filial). Itens, preços e disponibilidade são considerados no contexto dessa unidade. | Admin holding pode ter visão cross-unidade conforme permissão. |
| **RN09** | Disponibilidade para venda | É registrada venda/entrega de botijões. | A quantidade vendida/entregue não pode exceder o estoque disponível do tipo na unidade no momento da operação. | Vendas com comprometimento de estoque (pré-reserva) podem ser tratadas em regra específica. |
| **RN10** | Tipos de pagamento | O pedido é fechado com pagamento. | São aceitos: à vista, fiado (crédito), cartão, PIX. O tipo de pagamento determina o fluxo financeiro (caixa imediato vs. contas a receber). | Novos meios de pagamento podem ser parametrizados. |
| **RN11** | Fiado e limite de crédito | O pagamento é "fiado" (a prazo). | O valor a prazo não pode exceder o limite de crédito do cliente menos o saldo devedor atual. Caso exceda, a venda não é autorizada até regularização ou alteração de limite. | Admin holding ou gerente da filial pode ter permissão para override excepcional (registrado em auditoria). |
| **RN12** | Emissão de NF | A venda é confirmada e o sistema está integrado a emissor de NF. | A emissão de NF-e/NFC-e deve ser disparada conforme regras fiscais e parametrização da unidade; falhas devem ser registradas e permitir retry. | Emissão pode ser assíncrona; venda pode ser confirmada antes da autorização da NF conforme política. |

---

## 5. Comodato

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN13** | Comodato por cliente | Cliente recebe botijões em regime de comodato. | O sistema mantém registro de quantos vasilhames cada cliente possui em comodato (por tipo e por unidade). | — |
| **RN14** | Saída e retorno | Cliente recebe ou devolve botijões. | Na entrega: comodato do cliente aumenta e estoque da unidade diminui. Na devolução: comodato diminui e estoque da unidade aumenta. Ambas as movimentações são rastreáveis. | Devolução em unidade diferente pode ser tratada por regra de transferência entre unidades. |
| **RN15** | Comodato e venda | É realizada venda de gás (troca de botijão). | Na troca (vazio por cheio), o comodato do cliente pode permanecer constante; a movimentação de estoque (saída de cheio, entrada de vazio) deve ser registrada. | Venda de botijão novo (sem devolução) altera comodato e estoque conforme RN14. |

---

## 6. Financeiro e Crédito

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN16** | Limite de crédito por cliente | Cliente possui limite de crédito. | O limite é definido por cliente e pode ser parametrizado por unidade. O saldo devedor (contas a receber) não pode superar o limite para novas vendas a prazo (ver RN11). | Override excepcional por perfil autorizado, com registro em auditoria. |
| **RN17** | Limite por unidade e override | A holding ou a filial define limites. | Regras de crédito e limites padrão podem ser definidos por unidade. A holding pode definir override central (ex.: teto máximo por cliente em todas as filiais). | — |
| **RN18** | Inadimplência | Cliente possui parcelas ou débitos em atraso. | O sistema considera inadimplência para bloqueio ou restrição de novas vendas a prazo, conforme política parametrizada (ex.: bloquear se atraso > X dias). | Política (dias, valor mínimo) parametrizável por unidade. |
| **RN19** | Caixa e contas a receber | Ocorre pagamento à vista ou recebimento de valor a prazo. | Pagamento à vista impacta caixa da unidade. Recebimento de valor a prazo reduz contas a receber e impacta caixa. Toda movimentação financeira é auditável. | — |
| **RN20** | Consolidação financeira | A holding consulta resultados. | Faturamento, margem, inadimplência e demais indicadores financeiros são consolidados por unidade e em nível holding, respeitando permissões. | — |

---

## 7. Logística

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN21** | Rota vinculada à unidade | Uma rota é criada. | A rota pertence a uma unidade. Entregas e entregadores são considerados no contexto da unidade. | — |
| **RN22** | Otimização por região | Rotas são planejadas. | O sistema pode utilizar integração com serviço de roteirização (ex.: Google Maps/Fleet) para otimização por região, quando parametrizado. | Uso de roteirização externa é opcional por unidade. |
| **RN23** | Entrega e movimentação | Uma entrega é confirmada. | A confirmação de entrega dispara atualização de estoque (saída), comodato (se aplicável), financeiro (caixa/contas a receber) e gera registros de auditoria. | — |
| **RN24** | Retorno de vasilhames | Entregador registra retorno de botijões vazios. | O retorno é registrado por tipo e quantidade; estoque da unidade é atualizado e trilha de auditoria registrada. | — |

---

## 8. RH e Frota

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN25** | Entregador vinculado à unidade | Entregador é cadastrado ou alocado. | O entregador está vinculado a uma ou mais unidades, conforme configuração. Metas e entregas são apuradas por unidade. | — |
| **RN26** | Veículo e manutenção | Veículo da frota é utilizado ou passa por manutenção. | O sistema registra uso e manutenção de veículos. Alertas de manutenção preventiva podem ser parametrizados. | — |
| **RN27** | Metas comerciais | Avaliação de desempenho do entregador. | Metas comerciais (entregas, faturamento, etc.) podem ser configuradas e acompanhadas por entregador/unidade para indicadores do dashboard. | — |

---

## 9. Holding e Multi-unidade

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN28** | Unidade e filial | O sistema opera em contexto multi-unidade. | Toda operação de negócio (pedido, estoque, financeiro, rota) está associada a uma unidade (filial/depósito). A holding é o nível que agrega todas as unidades. | — |
| **RN29** | Regras por unidade | Configuração de estoque mínimo, limite de crédito padrão, etc. | Parâmetros de negócio podem ser definidos por unidade. A holding pode definir valores ou regras centralizadas que se aplicam a todas ou que permitem override por unidade. | — |
| **RN30** | Permissões por unidade | Usuário acessa o sistema. | O acesso a dados e funções pode ser restrito por unidade (ex.: gerente vê apenas sua filial). Admin holding pode ter visão e permissão sobre todas as unidades. | — |

---

## 10. Compliance e Auditoria

| ID | Regra | Quando | Então | Exceção |
|----|--------|--------|--------|---------|
| **RN31** | Trilhas de auditoria imutáveis | Ocorre movimentação de estoque, financeiro ou pedido. | Toda operação relevante gera registro de auditoria imutável (quem, quando, o quê, unidade, valor/quantidade quando aplicável). Registros não podem ser alterados ou apagados. | Apenas anexo de anotações explicativas pode ser permitido por política. |
| **RN32** | Conformidade ANP | Operação sujeita a padrões ANP. | O sistema deve suportar rastreabilidade e dados necessários para atendimento aos padrões regulatórios da ANP (vasilhames, movimentação, quando aplicável). | Escopo exato depende da regulamentação vigente e parametrização. |
| **RN33** | Integração NF-e/NFC-e | Venda ou documento fiscal é emitido. | Integração com ecossistema de NF-e/NFC-e segue padrões e validações definidos; falhas são registradas e tratadas com retry/timeout conforme política técnica. | — |
| **RN34** | Ações de usuário | Usuário executa ação no sistema. | Ações críticas (login, alteração de cadastros, override de limite, etc.) são registradas em log de auditoria com identificação do usuário, data/hora e contexto. | — |

---

## 11. Resumo por área

| Área | Regras |
|------|--------|
| **Estoque e Vasilhames** | RN01–RN07 |
| **Vendas e Pedidos** | RN08–RN12 |
| **Comodato** | RN13–RN15 |
| **Financeiro e Crédito** | RN16–RN20 |
| **Logística** | RN21–RN24 |
| **RH e Frota** | RN25–RN27 |
| **Holding e Multi-unidade** | RN28–RN30 |
| **Compliance e Auditoria** | RN31–RN34 |

---

## 12. Rastreabilidade

- As regras deste documento derivam da **EspecificacaoCorporativa.md**, da **IdeiaInicial.md** e da **AnaliseRequisitos.md**.
- Requisitos funcionais relacionados às regras de negócio estão mapeados na Análise de Requisitos (RF13–RF44 e domínios correspondentes).
- Atualizações em regras de negócio devem ser refletidas na especificação e nos critérios de aceite dos requisitos afetados.
