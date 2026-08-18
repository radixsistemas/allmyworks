import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import type { CreateProjetoInput, UpdateProjetoInput } from "./projetos.schemas";

export async function listProjetos(filters: { status?: "ATIVO" | "INATIVO" }) {
  return prisma.projeto.findMany({
    where: filters.status ? { status: filters.status } : {},
    orderBy: { nome: "asc" },
  });
}

export async function createProjeto(input: CreateProjetoInput) {
  return prisma.projeto.create({ data: { nome: input.nome } });
}

export async function updateProjeto(id: string, input: UpdateProjetoInput) {
  const existing = await prisma.projeto.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Projeto não encontrado");
  return prisma.projeto.update({ where: { id }, data: input });
}
