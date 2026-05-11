# CI/CD

O projeto usa GitHub Actions para validação contínua.

## Workflow

Arquivo:

```text
.github/workflows/ci.yml
```

Gatilhos:

- `push` em `main` ou `master`;
- `pull_request`.

## Etapas

| Etapa | Comando |
|-------|---------|
| Instalação | `pnpm install --frozen-lockfile` |
| Lint | `pnpm lint:ci` |
| Build | `pnpm build` |
| Testes unitários | `pnpm test` |
| Testes de integração | `pnpm test:integration` |
| Validação Docker Compose | `pnpm docker:config:apps` |

## Integração

O script raiz:

```bash
pnpm test:integration
```

executa as suítes de integração que têm specs reais hoje:

- `identity-service`;
- `catalog-service`;
- `dashboard-service`.

Pacotes que possuem `vitest.integration.config.ts`, mas ainda não possuem specs, devem ser adicionados ao script raiz quando receberem testes reais.

## Docker

A CI valida a sintaxe e a composição final dos arquivos:

```bash
pnpm docker:config:apps
```

Build e publicação de imagens ainda não fazem parte da pipeline. Quando houver registry definido, adicionar uma etapa separada para `pnpm docker:build:apps` e push das imagens.
