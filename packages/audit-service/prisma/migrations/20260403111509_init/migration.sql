-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "usuario_id" TEXT,
    "unidade_id" TEXT,
    "detalhes" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_servico_idx" ON "auditoria"("servico");

-- CreateIndex
CREATE INDEX "auditoria_entidade_entidade_id_idx" ON "auditoria"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_unidade_id_idx" ON "auditoria"("unidade_id");

-- CreateIndex
CREATE INDEX "auditoria_occurred_at_idx" ON "auditoria"("occurred_at");
