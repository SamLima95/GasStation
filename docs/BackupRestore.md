# Backup e Restore

Este documento descreve a rotina basica de backup e restauracao dos bancos PostgreSQL do GasStation.

## Bancos Cobertos

- `lframework`
- `lframework_identity`
- `lframework_stock`
- `lframework_order`
- `lframework_financial`
- `lframework_logistics`
- `lframework_audit`

## Backup Manual

Com o Docker Compose ativo:

```bash
pnpm backup:postgres
```

Por padrao, os arquivos sao criados em:

```text
backups/postgres/YYYYMMDD-HHMMSS/
```

Para escolher outro diretorio:

```bash
BACKUP_DIR=backups/postgres/manual-001 pnpm backup:postgres
```

Cada banco gera um arquivo `.dump` no formato custom do `pg_dump`, alem de um `manifest.txt`.

## Restore Manual

Atencao: o restore usa `pg_restore --clean --if-exists`, ou seja, substitui objetos existentes no banco de destino.

```bash
BACKUP_DIR=backups/postgres/YYYYMMDD-HHMMSS pnpm restore:postgres
```

Antes de restaurar em ambiente compartilhado ou producao, confirme:

- backup correto selecionado;
- containers apontando para o ambiente certo;
- janela de manutencao aprovada;
- migracoes Prisma compativeis com o backup;
- copia do backup armazenada fora do host.

## Automacao Recomendada

Exemplo de cron diario as 02:00:

```cron
0 2 * * * cd /caminho/GasStation && /usr/bin/env bash scripts/backup-postgres.sh >> backups/postgres/backup.log 2>&1
```

Recomendacoes operacionais:

- manter retencao minima de 7 backups diarios e 4 semanais;
- copiar backups para armazenamento externo;
- testar restore periodicamente em ambiente isolado;
- criptografar backups fora do ambiente local quando contiverem dados reais;
- registrar falhas de backup em ferramenta de monitoramento.

## Variaveis

- `POSTGRES_SERVICE`: nome do servico no Docker Compose. Padrao: `postgres`.
- `POSTGRES_USER`: usuario PostgreSQL. Padrao: `lframework`.
- `BACKUP_DIR`: diretorio de saida no backup ou origem no restore.
