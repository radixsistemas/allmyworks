import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import type { PutRegrasUsuarioInput } from "./regras-remuneracao.schemas";

/** Tela de configuração do admin: todos os tipos de trabalho ativos + a regra (se houver) para o usuário. */
export async function listRegrasPorUsuario(usuarioId: string) {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw HttpError.notFound("Usuário não encontrado");

  const tipos = await prisma.tipoTrabalho.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    include: {
      regrasRemuneracao: { where: { usuarioId } },
    },
  });

  return tipos.map((tipo) => {
    const { regrasRemuneracao, ...tipoTrabalho } = tipo;
    return {
      tipoTrabalho,
      regra: regrasRemuneracao[0] ?? null,
    };
  });
}

export async function setRegrasUsuario(usuarioId: string, input: PutRegrasUsuarioInput) {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw HttpError.notFound("Usuário não encontrado");

  await prisma.$transaction([
    prisma.regraRemuneracao.deleteMany({ where: { usuarioId } }),
    prisma.regraRemuneracao.createMany({
      data: input.regras.map((regra) => ({
        usuarioId,
        tipoTrabalhoId: regra.tipoTrabalhoId,
        modalidade: regra.modalidade,
        valorUnitario: regra.modalidade === "LIVRE" ? null : regra.valorUnitario,
      })),
    }),
  ]);

  return listRegrasPorUsuario(usuarioId);
}

/** Tela de lançamento do colaborador: tipos de trabalho habilitados para ele, com a regra de cálculo. */
export async function getRegrasParaLancamento(usuarioId: string) {
  const regras = await prisma.regraRemuneracao.findMany({
    where: { usuarioId, ativo: true, tipoTrabalho: { ativo: true } },
    include: { tipoTrabalho: true },
    orderBy: { tipoTrabalho: { nome: "asc" } },
  });
  return regras;
}
