-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('ADMIN', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'BLOQUEADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "ProjetoStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "ModalidadeRemuneracao" AS ENUM ('FIXO_POR_TRABALHO', 'FIXO_POR_UNIDADE', 'LIVRE');

-- CreateEnum
CREATE TYPE "LancamentoStatus" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "AuditoriaAcao" AS ENUM ('FECHAMENTO', 'REABERTURA', 'EDICAO_POS_FECHAMENTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "GlobalRole" NOT NULL DEFAULT 'COLABORADOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "senhaTemporaria" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "ProjetoStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_trabalho" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadePadrao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regras_remuneracao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoTrabalhoId" TEXT NOT NULL,
    "modalidade" "ModalidadeRemuneracao" NOT NULL,
    "valorUnitario" DECIMAL(12,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regras_remuneracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "tipoTrabalhoId" TEXT NOT NULL,
    "descricao" TEXT,
    "quantidade" DECIMAL(10,2) NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "linkEntrega" TEXT,
    "competencia" TEXT NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "status" "LancamentoStatus" NOT NULL DEFAULT 'ABERTO',
    "fechamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fechamentos" (
    "id" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "competencia" TEXT NOT NULL,
    "fechadoPorId" TEXT NOT NULL,
    "fechadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reaberto" BOOLEAN NOT NULL DEFAULT false,
    "reabertoPorId" TEXT,
    "reabertoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fechamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "acao" "AuditoriaAcao" NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "detalhes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_sistema" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "proximoPeriodoInicio" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "regras_remuneracao_usuarioId_tipoTrabalhoId_key" ON "regras_remuneracao"("usuarioId", "tipoTrabalhoId");

-- CreateIndex
CREATE INDEX "lancamentos_usuarioId_idx" ON "lancamentos"("usuarioId");

-- CreateIndex
CREATE INDEX "lancamentos_projetoId_idx" ON "lancamentos"("projetoId");

-- CreateIndex
CREATE INDEX "lancamentos_tipoTrabalhoId_idx" ON "lancamentos"("tipoTrabalhoId");

-- CreateIndex
CREATE INDEX "lancamentos_status_idx" ON "lancamentos"("status");

-- CreateIndex
CREATE INDEX "lancamentos_periodoInicio_periodoFim_idx" ON "lancamentos"("periodoInicio", "periodoFim");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_entidadeId_idx" ON "audit_logs"("entidade", "entidadeId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_remuneracao" ADD CONSTRAINT "regras_remuneracao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_remuneracao" ADD CONSTRAINT "regras_remuneracao_tipoTrabalhoId_fkey" FOREIGN KEY ("tipoTrabalhoId") REFERENCES "tipos_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_tipoTrabalhoId_fkey" FOREIGN KEY ("tipoTrabalhoId") REFERENCES "tipos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_fechamentoId_fkey" FOREIGN KEY ("fechamentoId") REFERENCES "fechamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_fechadoPorId_fkey" FOREIGN KEY ("fechadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_reabertoPorId_fkey" FOREIGN KEY ("reabertoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
