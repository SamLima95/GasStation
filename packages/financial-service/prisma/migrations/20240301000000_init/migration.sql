-- CreateEnum
CREATE TYPE "StatusCaixa" AS ENUM ('ABERTO', 'FECHADO');
CREATE TYPE "StatusContaAReceber" AS ENUM ('PENDENTE', 'PAGO_PARCIAL', 'PAGO', 'VENCIDO');

-- CreateTable
CREATE TABLE "caixas" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" TIMESTAMP(3),
    "status" "StatusCaixa" NOT NULL DEFAULT 'ABERTO',
    "saldo_inicial" DECIMAL(12,2) NOT NULL,
    "saldo_final" DECIMAL(12,2),
    CONSTRAINT "caixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_a_receber" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "caixa_id" TEXT,
    "valor_original" DECIMAL(12,2) NOT NULL,
    "valor_aberto" DECIMAL(12,2) NOT NULL,
    "status" "StatusContaAReceber" NOT NULL DEFAULT 'PENDENTE',
    "vencimento" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contas_a_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "replicated_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "last_event_at" TIMESTAMP(3) NOT NULL,
    "last_event_occurred_at" TIMESTAMP(3),
    CONSTRAINT "replicated_users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contas_a_receber" ADD CONSTRAINT "contas_a_receber_caixa_id_fkey" FOREIGN KEY ("caixa_id") REFERENCES "caixas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
