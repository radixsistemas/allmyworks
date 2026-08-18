import { z } from "zod";

export const relatorioQuerySchema = z.object({
  competencia: z.string().min(1, "Competência é obrigatória"),
  usuarioId: z.string().optional(),
  projetoId: z.string().optional(),
  tipoTrabalhoId: z.string().optional(),
});

export type RelatorioQuery = z.infer<typeof relatorioQuerySchema>;
