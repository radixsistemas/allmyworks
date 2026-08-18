import { Decimal } from "@prisma/client/runtime/library";
import { computePeriodo } from "@allmyworks/shared";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import type { AuthenticatedUser } from "../../middleware/auth";
import type { CreateLancamentoInput, ListLancamentosQuery, UpdateLancamentoInput } from "./lancamentos.schemas";

const lancamentoInclude = {
  usuario: { select: { id: true, nome: true, email: true } },
  projeto: true,
  tipoTrabalho: true,
} as const;

/** Regra de remuneração determina o valor unitário e se o campo fica travado para o colaborador. */
async function resolveValorUnitario(
  usuarioId: string,
  tipoTrabalhoId: string,
  valorUnitarioInformado?: number,
): Promise<Decimal> {
  const regra = await prisma.regraRemuneracao.findUnique({
    where: { usuarioId_tipoTrabalhoId: { usuarioId, tipoTrabalhoId } },
  });

  if (!regra || !regra.ativo) {
    throw HttpError.badRequest("Este tipo de trabalho não está habilitado no perfil de remuneração do usuário");
  }

  if (regra.modalidade === "LIVRE") {
    if (valorUnitarioInformado === undefined) {
      throw HttpError.badRequest("Informe o valor unitário para este tipo de trabalho");
    }
    return new Decimal(valorUnitarioInformado);
  }

  return regra.valorUnitario as Decimal;
}

/** Retorna o fechamento vigente para um período, se o período já estiver fechado. */
async function findFechamentoAtivo(periodoInicio: Date, periodoFim: Date) {
  const fechamento = await prisma.fechamento.findFirst({
    where: { dataInicio: periodoInicio, dataFim: periodoFim },
    orderBy: { fechadoEm: "desc" },
  });
  if (fechamento && !fechamento.reaberto) return fechamento;
  return null;
}

export async function listLancamentos(user: AuthenticatedUser, filters: ListLancamentosQuery) {
  const isAdmin = user.papel === "ADMIN";

  return prisma.lancamento.findMany({
    where: {
      usuarioId: isAdmin ? filters.usuarioId : user.id,
      projetoId: filters.projetoId,
      tipoTrabalhoId: filters.tipoTrabalhoId,
      competencia: filters.competencia,
      status: filters.status,
    },
    include: lancamentoInclude,
    orderBy: { dataEntrega: "desc" },
  });
}

export async function createLancamento(user: AuthenticatedUser, input: CreateLancamentoInput) {
  const projeto = await prisma.projeto.findUnique({ where: { id: input.projetoId } });
  if (!projeto) throw HttpError.notFound("Projeto não encontrado");
  if (projeto.status !== "ATIVO") throw HttpError.badRequest("Este projeto não está mais ativo");

  const tipoTrabalho = await prisma.tipoTrabalho.findUnique({ where: { id: input.tipoTrabalhoId } });
  if (!tipoTrabalho || !tipoTrabalho.ativo) throw HttpError.badRequest("Tipo de trabalho inválido");

  const valorUnitario = await resolveValorUnitario(user.id, input.tipoTrabalhoId, input.valorUnitario);
  const quantidade = new Decimal(input.quantidade);
  const valorTotal = quantidade.mul(valorUnitario);

  const periodo = computePeriodo(input.dataEntrega);
  const fechamentoAtivo = await findFechamentoAtivo(periodo.inicio, periodo.fim);

  if (fechamentoAtivo && user.papel !== "ADMIN") {
    throw HttpError.forbidden("O período desta data de entrega já está fechado. Contate o administrador.");
  }

  return prisma.lancamento.create({
    data: {
      usuarioId: user.id,
      projetoId: input.projetoId,
      tipoTrabalhoId: input.tipoTrabalhoId,
      descricao: input.descricao,
      quantidade,
      dataEntrega: input.dataEntrega,
      valorUnitario,
      valorTotal,
      linkEntrega: input.linkEntrega || null,
      competencia: periodo.competencia,
      periodoInicio: periodo.inicio,
      periodoFim: periodo.fim,
      status: fechamentoAtivo ? "FECHADO" : "ABERTO",
      fechamentoId: fechamentoAtivo?.id ?? null,
    },
    include: lancamentoInclude,
  });
}

export async function updateLancamento(user: AuthenticatedUser, id: string, input: UpdateLancamentoInput) {
  const existing = await prisma.lancamento.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Lançamento não encontrado");

  const isAdmin = user.papel === "ADMIN";
  if (!isAdmin) {
    if (existing.usuarioId !== user.id) throw HttpError.forbidden("Este lançamento não pertence a você");
    if (existing.status === "FECHADO") {
      throw HttpError.forbidden("Este lançamento já está em um período fechado. Apenas o administrador pode editá-lo.");
    }
  }

  const projetoId = input.projetoId ?? existing.projetoId;
  if (input.projetoId) {
    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) throw HttpError.notFound("Projeto não encontrado");
  }

  const tipoTrabalhoId = input.tipoTrabalhoId ?? existing.tipoTrabalhoId;
  const dataEntrega = input.dataEntrega ?? existing.dataEntrega;
  const quantidade = input.quantidade !== undefined ? new Decimal(input.quantidade) : existing.quantidade;

  let valorUnitario: Decimal;
  if (isAdmin && input.valorUnitario !== undefined) {
    // Admin pode sobrescrever o valor diretamente, inclusive em lançamentos já fechados.
    valorUnitario = new Decimal(input.valorUnitario);
  } else if (input.tipoTrabalhoId || input.valorUnitario !== undefined || input.quantidade !== undefined) {
    valorUnitario = await resolveValorUnitario(existing.usuarioId, tipoTrabalhoId, input.valorUnitario);
  } else {
    valorUnitario = existing.valorUnitario;
  }

  const valorTotal = quantidade.mul(valorUnitario);

  const periodo = computePeriodo(dataEntrega);
  const fechamentoAtivo = await findFechamentoAtivo(periodo.inicio, periodo.fim);
  if (fechamentoAtivo && !isAdmin) {
    throw HttpError.forbidden("O período desta data de entrega já está fechado. Contate o administrador.");
  }

  const foiEdicaoPosFechamento = isAdmin && existing.status === "FECHADO";

  const updated = await prisma.lancamento.update({
    where: { id },
    data: {
      projetoId,
      tipoTrabalhoId,
      descricao: input.descricao ?? existing.descricao,
      quantidade,
      dataEntrega,
      valorUnitario,
      valorTotal,
      linkEntrega: input.linkEntrega !== undefined ? input.linkEntrega || null : existing.linkEntrega,
      competencia: periodo.competencia,
      periodoInicio: periodo.inicio,
      periodoFim: periodo.fim,
      status: fechamentoAtivo ? "FECHADO" : "ABERTO",
      fechamentoId: fechamentoAtivo?.id ?? null,
    },
    include: lancamentoInclude,
  });

  if (foiEdicaoPosFechamento) {
    await prisma.auditLog.create({
      data: {
        acao: "EDICAO_POS_FECHAMENTO",
        entidade: "LANCAMENTO",
        entidadeId: id,
        usuarioId: user.id,
        detalhes: { antes: serializeForLog(existing), depois: serializeForLog(updated) },
      },
    });
  }

  return updated;
}

export async function deleteLancamento(user: AuthenticatedUser, id: string) {
  const existing = await prisma.lancamento.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Lançamento não encontrado");

  const isAdmin = user.papel === "ADMIN";
  if (!isAdmin) {
    if (existing.usuarioId !== user.id) throw HttpError.forbidden("Este lançamento não pertence a você");
    if (existing.status === "FECHADO") {
      throw HttpError.forbidden("Este lançamento já está em um período fechado. Apenas o administrador pode excluí-lo.");
    }
  }

  await prisma.lancamento.delete({ where: { id } });

  if (isAdmin && existing.status === "FECHADO") {
    await prisma.auditLog.create({
      data: {
        acao: "EDICAO_POS_FECHAMENTO",
        entidade: "LANCAMENTO",
        entidadeId: id,
        usuarioId: user.id,
        detalhes: { acao: "exclusao", lancamento: serializeForLog(existing) },
      },
    });
  }
}

function serializeForLog(lancamento: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(lancamento));
}
