import { z } from "zod";

export const updateConfiguracaoSchema = z.object({
  proximoPeriodoInicio: z.coerce.date(),
});

export type UpdateConfiguracaoInput = z.infer<typeof updateConfiguracaoSchema>;
