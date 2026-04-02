-- CreateTable
CREATE TABLE "unidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_unidade" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'operador',
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_unidade" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_unidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_unidade_user_id_unidade_id_key" ON "usuario_unidade"("user_id", "unidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_unidade_unidade_id_chave_key" ON "configuracao_unidade"("unidade_id", "chave");

-- AddForeignKey
ALTER TABLE "usuario_unidade" ADD CONSTRAINT "usuario_unidade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_unidade" ADD CONSTRAINT "usuario_unidade_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_unidade" ADD CONSTRAINT "configuracao_unidade_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
