import { z } from "zod";

export const createTipoTrabalhoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  unidadePadrao: z.string().optional(),
});

export const updateTipoTrabalhoSchema = z.object({
  nome: z.string().min(1).optional(),
  unidadePadrao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export const listTiposTrabalhoQuerySchema = z.object({
  ativo: z.coerce.boolean().optional(),
});

export type CreateTipoTrabalhoInput = z.infer<typeof createTipoTrabalhoSchema>;
export type UpdateTipoTrabalhoInput = z.infer<typeof updateTipoTrabalhoSchema>;
