import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import type { CreateTipoTrabalhoInput, UpdateTipoTrabalhoInput } from "./tipos-trabalho.schemas";

export async function listTiposTrabalho(filters: { ativo?: boolean }) {
  return prisma.tipoTrabalho.findMany({
    where: filters.ativo !== undefined ? { ativo: filters.ativo } : {},
    orderBy: { nome: "asc" },
  });
}

export async function createTipoTrabalho(input: CreateTipoTrabalhoInput) {
  return prisma.tipoTrabalho.create({ data: input });
}

export async function updateTipoTrabalho(id: string, input: UpdateTipoTrabalhoInput) {
  const existing = await prisma.tipoTrabalho.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Tipo de trabalho não encontrado");
  return prisma.tipoTrabalho.update({ where: { id }, data: input });
}
