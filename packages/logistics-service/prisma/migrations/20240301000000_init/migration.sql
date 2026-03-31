-- CreateEnum
CREATE TYPE "StatusRota" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');
CREATE TYPE "StatusEntrega" AS ENUM ('PENDENTE', 'EM_TRANSITO', 'ENTREGUE', 'FALHA');

-- CreateTable
CREATE TABLE "entregadores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "unidade_id" TEXT NOT NULL,
    CONSTRAINT "entregadores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "unidade_id" TEXT NOT NULL,
    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rotas" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "entregador_id" TEXT NOT NULL,
    "veiculo_id" TEXT NOT NULL,
    "data_rota" TIMESTAMP(3) NOT NULL,
    "status" "StatusRota" NOT NULL DEFAULT 'PLANEJADA',
    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "entregas" (
    "id" TEXT NOT NULL,
    "rota_id" TEXT,
    "pedido_id" TEXT NOT NULL,
    "status" "StatusEntrega" NOT NULL DEFAULT 'PENDENTE',
    "data_confirmacao" TIMESTAMP(3),
    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- AddForeignKey
ALTER TABLE "rotas" ADD CONSTRAINT "rotas_entregador_id_fkey" FOREIGN KEY ("entregador_id") REFERENCES "entregadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rotas" ADD CONSTRAINT "rotas_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_rota_id_fkey" FOREIGN KEY ("rota_id") REFERENCES "rotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
