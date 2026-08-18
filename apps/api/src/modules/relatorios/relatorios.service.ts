import { prisma } from "../../lib/prisma";
import type { RelatorioQuery } from "./relatorios.schemas";

const lancamentoInclude = {
  usuario: { select: { id: true, nome: true, email: true } },
  projeto: true,
  tipoTrabalho: true,
} as const;

export type RelatorioLancamento = Awaited<ReturnType<typeof buscarLancamentos>>[number];

async function buscarLancamentos(filters: RelatorioQuery) {
  return prisma.lancamento.findMany({
    where: {
      competencia: filters.competencia,
      usuarioId: filters.usuarioId,
      projetoId: filters.projetoId,
      tipoTrabalhoId: filters.tipoTrabalhoId,
    },
    include: lancamentoInclude,
    orderBy: [{ usuario: { nome: "asc" } }, { dataEntrega: "asc" }],
  });
}

export interface RelatorioPorUsuario {
  usuario: { id: string; nome: string; email: string };
  lancamentos: RelatorioLancamento[];
  total: number;
}

export interface RelatorioPagamentos {
  competencia: string;
  fechada: boolean;
  porUsuario: RelatorioPorUsuario[];
  totalGeral: number;
}

export async function montarRelatorio(filters: RelatorioQuery): Promise<RelatorioPagamentos> {
  const lancamentos = await buscarLancamentos(filters);

  const porUsuarioMap = new Map<string, RelatorioPorUsuario>();
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

  const fechada = lancamentos.length > 0 && lancamentos.every((l) => l.status === "FECHADO");

  return {
    competencia: filters.competencia,
    fechada,
    porUsuario: Array.from(porUsuarioMap.values()),
    totalGeral,
  };
}

export async function getRelatorioPagamentos(filters: RelatorioQuery) {
  return montarRelatorio(filters);
}
