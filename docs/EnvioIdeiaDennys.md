GasStation — Plataforma de Governança de Ativos e Conformidade

Cliente-Alvo:

Distribuidoras de gás de pequeno e médio porte que operam com múltiplas filiais ou depósitos e necessitam de controle integrado de estoque de vasilhames (botijões), gestão de rotas de entrega, controle financeiro, conformidade com ANP e NF-e, e visão consolidada (holding) de resultados e ativos, substituindo processos manuais, planilhas e anotações em papel.


A "Dor" Central (O Problema):

A operação da distribuidora sofre com falta de controle operacional e estratégico. Processos manuais, anotações em papel ou planilhas desconectadas geram erros, perdas de estoque, falhas em entregas e dificuldade para visualizar o lucro real. Não há rastreabilidade confiável de vasilhames (comodato, entrada/saída/retorno), nem visão unificada quando existem várias filiais. A conformidade regulatória (ANP, emissão de NF-e) e a auditoria para fins jurídicos ficam fragilizadas, e a integração com roteirização e sistemas externos é inexistente ou pontual.


A Solução (O Core e os 4 Módulos):

O CORE: Governança, Identidade e Auditoria (Core Corporativo): É a espinha dorsal do sistema. Centraliza a visão de holding (múltiplas filiais e depósitos), consolida estoques de vasilhames e resultados financeiros em nível macro e por unidade. Gerencia usuários, perfis e permissões (RBAC) por módulo e por unidade, com autenticação segura (JWT/OAuth2), recuperação de senha e controle de sessão. Mantém trilhas de auditoria imutáveis para toda movimentação de estoque, financeira e de pedidos (quem, quando, o quê, unidade), garantindo compliance jurídico e rastreabilidade. Sem esse núcleo, não há multi-unidade confiável nem segurança e auditoria adequadas para um sistema corporativo.


Módulo 1: Estoque e Vasilhames: Controla o ativo imobilizado (botijões) por tipo (P13, P45, etc.), com rastreabilidade de entrada, saída e retorno de vasilhames. Registra comodato por cliente, alertas de estoque mínimo e previsão de reposição com base no histórico. Expõe saldos e movimentações via API para os demais módulos e para o dashboard, e publica eventos via RabbitMQ (ex.: reserva liberada, estoque atualizado) para processamento assíncrono e consistência entre serviços.


Módulo 2: Vendas e Pedidos: Recebe e processa pedidos (via app interno ou integrações), gerencia comodato e formas de pagamento (à vista, fiado, cartão, PIX). Integra com o módulo de estoque para reserva de vasilhames e com o financeiro para caixa e contas a receber. Envia eventos para fila de emissão de NF-e/NFC-e (processamento assíncrono) e expõe APIs para o front-end e para sistemas externos, com controle de inadimplência e limite de crédito por cliente.


Módulo 3: Logística e Frota: Gerencia rotas de entrega com otimização por região e acompanhamento em tempo real. Integra com serviços de roteirização (Google Maps/Fleet ou equivalentes) e com RH/Frota (entregadores, veículos, manutenção, metas). Consome eventos de pedidos confirmados e estoque (RabbitMQ) para planejamento e execução de entregas, e publica eventos de entrega concluída para atualização financeira e de estoque. Expõe APIs para dashboard de KPIs (desempenho por entregador) e para apps de campo.


Módulo 4: Financeiro e Compliance: Centraliza caixa, contas a receber, inadimplência e limite de crédito por cliente. Consolida resultados por unidade e em nível holding (faturamento, margem, ticket médio). Processa pagamentos de forma assíncrona quando necessário e integra com o ecossistema externo (NF-e/NFC-e, conformidade ANP). Alimenta o dashboard com indicadores financeiros e de inadimplência e garante que toda movimentação seja auditável e compatível com LGPD e exigências regulatórias.


O Desafio de Integração/Corporativo:

O projeto se caracteriza como corporativo por sua arquitetura em microsserviços (Estoque, Vendas, Logística, Financeiro e Core de Governança), uso de banco relacional (dados críticos e transacionais) e não relacional (cache, logs, documentos), comunicação exclusiva via API RESTful entre front-end e back-end, e processamento assíncrono com RabbitMQ (filas, retry, dead-letter). O desafio principal é manter a consistência dos dados entre os módulos enquanto tarefas pesadas (emissão de NF-e, geração de relatórios, roteirização, atualização de KPIs) rodam em fila, e expor APIs seguras e versionadas para o dashboard de KPIs em tempo (quase) real e para sistemas externos — Sefaz, roteirização, ANP — com interoperabilidade bidirecional, logs de integração, RBAC e trilhas de auditoria imutáveis em ambiente multi-unidade (holding).


Aluno: Samuel Lima
