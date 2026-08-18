import { z } from "zod";
import { MODALIDADES_REMUNERACAO } from "@allmyworks/shared";

const regraItemSchema = z
  .object({
    tipoTrabalhoId: z.string().min(1),
    modalidade: z.enum(MODALIDADES_REMUNERACAO),
    valorUnitario: z.coerce.number().positive().optional(),
  })
  .refine((data) => data.modalidade === "LIVRE" || data.valorUnitario !== undefined, {
    message: "Valor unitário é obrigatório para as modalidades fixas",
    path: ["valorUnitario"],
  });

export const putRegrasUsuarioSchema = z.object({
  regras: z.array(regraItemSchema),
});

export type PutRegrasUsuarioInput = z.infer<typeof putRegrasUsuarioSchema>;
