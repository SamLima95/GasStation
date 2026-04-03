-- CreateEnum
CREATE TYPE "StatusNotaFiscal" AS ENUM ('PENDENTE', 'AUTORIZADA', 'REJEITADA', 'FALHA');

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "chave_acesso" TEXT,
    "status" "StatusNotaFiscal" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "mensagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
