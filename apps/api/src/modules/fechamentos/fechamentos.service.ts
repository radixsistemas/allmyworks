import { computePeriodo, proximoPeriodo } from "@allmyworks/shared";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { getConfiguracao, setProximoPeriodoInicio } from "../configuracao/configuracao.service";
import type { AuthenticatedUser } from "../../middleware/auth";
import type { FecharPeriodoInput, PreviewQuery } from "./fechamentos.schemas";

const lancamentoInclude = {
  usuario: { select: { id: true, nome: true, email: true } },
  projeto: true,
  tipoTrabalho: true,
} as const;

/** Sugestão do próximo período a fechar, com base na configuração global. */
export async function sugerirProximoPeriodo() {
  const config = await getConfiguracao();
  return computePeriodo(config.proximoPeriodoInicio);
}

export async function previewFechamento(filters: PreviewQuery) {
  const lancamentos = await prisma.lancamento.findMany({
    where: { periodoInicio: filters.dataInicio, periodoFim: filters.dataFim },
    include: lancamentoInclude,
    orderBy: [{ usuario: { nome: "asc" } }, { dataEntrega: "asc" }],
  });

  const porUsuarioMap = new Map<string, { usuario: (typeof lancamentos)[number]["usuario"]; lancamentos: typeof lancamentos; total: number }>();
  let totalGeral = 0;

  for (const lancamento of lancamentos) {
    const total = Number(lancamento.valorTotal);
    totalGeral += total;
    const key = lancamento.usuarioId;
    if (!porUsuarioMap.has(key)) {
      porUsuarioMap.set(key, { usuario: lancamento.usuario, lancamentos: [], total: 0 });
    }
    const entry = porUsuarioMap.get(key)!;
    entry.lancamentos.push(lancamento);
    entry.total += total;
  }

  return {
    lancamentos,
    porUsuario: Array.from(porUsuarioMap.values()),
    totalGeral,
    quantidadeLancamentos: lancamentos.length,
  };
}

export async function listFechamentos() {
  return prisma.fechamento.findMany({
    include: {
      fechadoPor: { select: { id: true, nome: true } },
      reabertoPor: { select: { id: true, nome: true } },
      _count: { select: { lancamentos: true } },
    },
    orderBy: { fechadoEm: "desc" },
  });
}

export async function fecharPeriodo(user: AuthenticatedUser, input: FecharPeriodoInput) {
  const fechamentoExistente = await prisma.fechamento.findFirst({
    where: { dataInicio: input.dataInicio, dataFim: input.dataFim },
    orderBy: { fechadoEm: "desc" },
  });
  if (fechamentoExistente && !fechamentoExistente.reaberto) {
    throw HttpError.conflict("Este período já está fechado");
  }

  const lancamentos = await prisma.lancamento.findMany({
    where: { periodoInicio: input.dataInicio, periodoFim: input.dataFim, status: "ABERTO" },
    select: { id: true },
  });

  const fechamento = await prisma.$transaction(async (tx) => {
    const criado = await tx.fechamento.create({
      data: {
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        competencia: input.competencia,
        fechadoPorId: user.id,
      },
    });

    await tx.lancamento.updateMany({
      where: { id: { in: lancamentos.map((l) => l.id) } },
      data: { status: "FECHADO", fechamentoId: criado.id },
    });

    await tx.auditLog.create({
      data: {
        acao: "FECHAMENTO",
        entidade: "FECHAMENTO",
        entidadeId: criado.id,
        usuarioId: user.id,
        detalhes: { competencia: input.competencia, quantidadeLancamentos: lancamentos.length },
      },
    });

    return criado;
  });

  const proximo = proximoPeriodo(input.dataInicio);
  await setProximoPeriodoInicio(proximo.inicio);

  return fechamento;
}

export async function reabrirFechamento(user: AuthenticatedUser, id: string) {
  const fechamento = await prisma.fechamento.findUnique({ where: { id } });
  if (!fechamento) throw HttpError.notFound("Fechamento não encontrado");
  if (fechamento.reaberto) throw HttpError.conflict("Este fechamento já foi reaberto");

  const atualizado = await prisma.$transaction(async (tx) => {
    const reaberto = await tx.fechamento.update({
      where: { id },
      data: { reaberto: true, reabertoPorId: user.id, reabertoEm: new Date() },
    });

    await tx.lancamento.updateMany({
      where: { fechamentoId: id },
      data: { status: "ABERTO" },
    });

    await tx.auditLog.create({
      data: {
        acao: "REABERTURA",
        entidade: "FECHAMENTO",
        entidadeId: id,
        usuarioId: user.id,
        detalhes: { competencia: fechamento.competencia },
      },
    });

    return reaberto;
  });

  return atualizado;
}
