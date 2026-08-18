import { z } from "zod";
import { LANCAMENTO_STATUSES } from "@allmyworks/shared";

export const createLancamentoSchema = z.object({
  projetoId: z.string().min(1, "Projeto é obrigatório"),
  tipoTrabalhoId: z.string().min(1, "Tipo de trabalho é obrigatório"),
  descricao: z.string().optional(),
  quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  dataEntrega: z.coerce.date(),
  valorUnitario: z.coerce.number().positive().optional(),
  linkEntrega: z.union([z.string().url("Link inválido"), z.literal("")]).optional(),
});

export const updateLancamentoSchema = z.object({
  projetoId: z.string().min(1).optional(),
  tipoTrabalhoId: z.string().min(1).optional(),
  descricao: z.string().optional(),
  quantidade: z.coerce.number().positive().optional(),
  dataEntrega: z.coerce.date().optional(),
  valorUnitario: z.coerce.number().positive().optional(),
  linkEntrega: z.union([z.string().url("Link inválido"), z.literal("")]).optional(),
});

export const listLancamentosQuerySchema = z.object({
  usuarioId: z.string().optional(),
  projetoId: z.string().optional(),
  tipoTrabalhoId: z.string().optional(),
  competencia: z.string().optional(),
  status: z.enum(LANCAMENTO_STATUSES).optional(),
});

export type CreateLancamentoInput = z.infer<typeof createLancamentoSchema>;
export type UpdateLancamentoInput = z.infer<typeof updateLancamentoSchema>;
export type ListLancamentosQuery = z.infer<typeof listLancamentosQuerySchema>;
