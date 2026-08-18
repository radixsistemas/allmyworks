import { z } from "zod";
import { PROJETO_STATUSES } from "@allmyworks/shared";

export const createProjetoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export const updateProjetoSchema = z.object({
  nome: z.string().min(1).optional(),
  status: z.enum(PROJETO_STATUSES).optional(),
});

export const listProjetosQuerySchema = z.object({
  status: z.enum(PROJETO_STATUSES).optional(),
});

export type CreateProjetoInput = z.infer<typeof createProjetoSchema>;
export type UpdateProjetoInput = z.infer<typeof updateProjetoSchema>;
