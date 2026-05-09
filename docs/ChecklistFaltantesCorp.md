# Checklist de Itens Faltantes Corporativos

Checklist baseado na comparacao entre `docs/RequisitosCorp.md` e o estado atual do projeto.

## 1. Gestao de Usuarios

- [x] Implementar edicao de usuarios.
- [x] Implementar exclusao/desativacao de usuarios.
- [ ] Implementar recuperacao de senha.
- [ ] Implementar logout server-side ou revogacao antecipada de tokens.
- [ ] Implementar controle de sessoes com timeout, refresh token e revogacao.
- [ ] Registrar logs de login, logout, falhas de autenticacao e alteracoes de usuario.

## 2. Controle de Acesso

- [ ] Evoluir `requireRole` para RBAC completo em todos os modulos.
- [x] Criar middleware `requirePermission` para autorizacao por permissao.
- [x] Criar matriz de perfis e permissoes por modulo.
- [x] Persistir permissoes em banco de dados.
- [ ] Aplicar autorizacao por permissao nos endpoints sensiveis de todos os servicos.
- [x] Criar testes para acesso permitido e negado por perfil.
- [ ] Auditar tentativas de acesso negadas.

## 3. Auditoria e Rastreamento

- [ ] Garantir auditoria automatica para acoes criticas em todos os servicos.
- [ ] Auditar criacao, alteracao e exclusao/desativacao de cadastros.
- [ ] Auditar movimentacoes de estoque, pedidos, financeiro, logistica e configuracoes.
- [ ] Implementar historico de alteracoes por entidade.
- [ ] Implementar versionamento de dados ou snapshots para entidades criticas.
- [ ] Impedir alteracao/exclusao de registros de auditoria por regra de banco ou politica de aplicacao.
- [ ] Padronizar payloads de auditoria entre microsservicos.

## 4. Dashboard e KPIs

- [ ] Validar atualizacao quase real-time dos KPIs.
- [ ] Definir SLA/intervalo oficial de atualizacao dinamica.
- [ ] Adicionar testes cobrindo filtros por periodo e unidade.
- [ ] Adicionar testes cobrindo exportacao de relatorios.
- [ ] Documentar origem de cada KPI exibido no dashboard.

## 5. Seguranca

- [ ] Implementar criptografia de dados sensiveis em repouso quando aplicavel.
- [ ] Documentar quais dados sao sensiveis e como sao protegidos.
- [ ] Adicionar politica LGPD: consentimento, retencao, exclusao/anomizacao e finalidade de uso.
- [ ] Implementar backup automatizado dos bancos.
- [ ] Documentar estrategia de restore.
- [ ] Testar restauracao de backup.
- [ ] Aplicar rate limiting global ou por grupo de endpoints sensiveis.
- [ ] Adicionar headers de seguranca HTTP, como Helmet/CSP, quando aplicavel.
- [ ] Revisar protecao contra XSS no front-end.
- [ ] Criar testes de seguranca basicos para autenticacao, autorizacao e validacao de entrada.

## 6. Performance

- [ ] Definir metas de tempo de resposta por endpoint.
- [ ] Medir tempo de resposta dos principais fluxos.
- [ ] Revisar consultas Prisma mais pesadas e adicionar indices quando necessario.
- [ ] Padronizar uso de cache Redis nos endpoints de leitura critica.
- [ ] Definir politica de invalidacao de cache por dominio.
- [ ] Automatizar ou documentar execucao de teste de carga.
- [ ] Adicionar relatorio de resultado do teste de carga.

## 7. Escalabilidade

- [ ] Documentar estrategia de escalabilidade horizontal por servico.
- [ ] Criar configuracao para multiplas replicas em ambiente orquestrado.
- [ ] Garantir que todos os servicos sejam stateless em producao.
- [ ] Validar que sessoes ou estados temporarios nao dependem de memoria local.
- [ ] Definir limites de conexoes com banco, Redis e RabbitMQ por servico.
- [ ] Documentar estrategia de balanceamento de carga alem do Nginx local.

## 8. Disponibilidade

- [ ] Implementar monitoramento com metricas de aplicacao.
- [ ] Adicionar endpoint `/metrics` ou integracao com Prometheus/OpenTelemetry.
- [ ] Criar dashboards operacionais de saude dos servicos.
- [ ] Configurar alertas para erro, latencia, indisponibilidade e filas acumuladas.
- [ ] Definir estrategia de failover para banco, Redis e RabbitMQ.
- [ ] Documentar plano de recuperacao de desastre.
- [ ] Criar health checks que validem dependencias criticas, nao apenas processo HTTP.

## 9. Interoperabilidade

- [ ] Implementar integracao real com emissor de NF-e/NFC-e.
- [ ] Implementar integracao real com servico de roteirizacao externa, se exigido no escopo.
- [ ] Criar endpoints ou consumidores para receber webhooks externos.
- [ ] Validar autenticacao de webhooks e integracoes externas.
- [ ] Registrar logs de integracao externa.
- [ ] Implementar retry e timeout padronizados para chamadas externas.
- [ ] Versionar contratos de integracao externa.
- [ ] Criar testes de falha para integracoes externas.

## 10. Microsservicos

- [ ] Revisar se cada servico possui responsabilidade unica documentada.
- [ ] Garantir banco isolado por microsservico em ambiente real.
- [ ] Documentar contratos de eventos entre microsservicos.
- [ ] Criar testes de contrato para APIs e eventos.
- [ ] Padronizar middlewares obrigatorios entre servicos.
- [ ] Padronizar tratamento de erros e respostas em todos os endpoints.

## 11. Front-end e Back-end

- [ ] Garantir que o front-end nao dependa de regras de negocio duplicadas.
- [ ] Documentar configuracao de ambientes do front-end.
- [ ] Validar fluxo completo via API Gateway.
- [ ] Criar testes E2E para fluxos principais de negocio.
- [ ] Validar comportamento do front-end quando um microsservico esta indisponivel.

## 12. Banco de Dados

- [ ] Revisar integridade referencial em todos os schemas Prisma.
- [ ] Adicionar indices para consultas frequentes.
- [ ] Definir politica de migracoes em producao.
- [ ] Documentar estrategia de dados relacionais versus cache/logs.
- [ ] Avaliar uso de armazenamento nao relacional para logs/documentos quando necessario.
- [ ] Garantir transacoes ACID em fluxos criticos.

## 13. Mensageria com RabbitMQ

- [ ] Padronizar retry automatico em todos os consumidores.
- [ ] Padronizar dead-letter queues em todos os fluxos de eventos.
- [ ] Definir quantidade maxima de tentativas por fila.
- [ ] Registrar metricas de filas, falhas e mensagens acumuladas.
- [ ] Criar testes para mensagens invalidas e falhas de processamento.
- [ ] Documentar exchanges, routing keys, filas e payloads.
- [ ] Garantir idempotencia nos consumidores.

## 14. Processamento Assincrono

- [ ] Criar infraestrutura clara para jobs em background.
- [ ] Definir quais tarefas pesadas devem ser assincronas.
- [ ] Implementar retry com backoff para jobs.
- [ ] Registrar falhas de jobs para auditoria ou observabilidade.
- [ ] Criar processo de reprocessamento de mensagens em DLQ.
- [ ] Documentar estrategia de atualizacao assincrona de KPIs.

## 15. Infraestrutura

- [ ] Criar Dockerfile para cada servico, se o deploy exigir imagens independentes.
- [ ] Criar manifests Kubernetes ou Helm charts.
- [ ] Configurar autoscaling.
- [ ] Configurar secrets e config maps por ambiente.
- [ ] Separar configuracoes de desenvolvimento, homologacao e producao.
- [ ] Criar pipeline de deploy seguro com rollback.
- [ ] Documentar processo de provisionamento de ambiente.

## 16. CI/CD

- [ ] Criar pipeline automatizado de lint.
- [ ] Criar pipeline automatizado de build.
- [ ] Criar pipeline automatizado de testes unitarios.
- [ ] Criar pipeline automatizado de testes de integracao.
- [ ] Criar pipeline automatizado de testes E2E, se aplicavel.
- [ ] Adicionar validacao de migracoes Prisma.
- [ ] Adicionar publicacao/build de imagens Docker.
- [ ] Adicionar etapa de deploy por ambiente.

## 17. Testes

- [ ] Ampliar cobertura de testes unitarios nos servicos com menos testes.
- [ ] Ampliar testes de integracao para todos os microsservicos.
- [ ] Criar testes de contrato para APIs REST.
- [ ] Criar testes de contrato para eventos RabbitMQ.
- [ ] Criar testes de carga automatizados e documentados.
- [ ] Criar testes de seguranca.
- [ ] Criar testes E2E dos principais fluxos do sistema.
- [ ] Documentar como executar cada suite de teste.

## 18. Governanca

- [ ] Criar politica de code review obrigatorio.
- [ ] Criar guia de seguranca da informacao.
- [ ] Manter documentacao tecnica atualizada com a arquitetura real.
- [ ] Atualizar README para refletir todos os microsservicos atuais.
- [ ] Criar checklist de release.
- [ ] Criar politica de versionamento de APIs.
- [ ] Criar politica de versionamento de eventos.
- [ ] Criar processo de monitoramento continuo.
