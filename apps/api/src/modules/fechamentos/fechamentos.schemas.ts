import { z } from "zod";

export const previewQuerySchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
});

export const fecharPeriodoSchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  competencia: z.string().min(1, "Competência é obrigatória"),
});

export type PreviewQuery = z.infer<typeof previewQuerySchema>;
export type FecharPeriodoInput = z.infer<typeof fecharPeriodoSchema>;
