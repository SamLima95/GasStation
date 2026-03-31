-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'RETORNO', 'AVARIA', 'AJUSTE');

-- CreateTable
CREATE TABLE "vasilhames" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "capacidade" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vasilhames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "vasilhame_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "tipo_movimentacao" "TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comodatos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "vasilhame_id" TEXT NOT NULL,
    "saldo_comodato" INTEGER NOT NULL,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comodatos_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "comodatos_cliente_id_unidade_id_vasilhame_id_key" ON "comodatos"("cliente_id", "unidade_id", "vasilhame_id");

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_vasilhame_id_fkey" FOREIGN KEY ("vasilhame_id") REFERENCES "vasilhames"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comodatos" ADD CONSTRAINT "comodatos_vasilhame_id_fkey" FOREIGN KEY ("vasilhame_id") REFERENCES "vasilhames"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
