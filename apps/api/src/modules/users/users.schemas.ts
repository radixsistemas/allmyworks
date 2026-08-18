import { z } from "zod";
import { GLOBAL_ROLES, USER_STATUSES } from "@allmyworks/shared";

export const createUserSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  papel: z.enum(GLOBAL_ROLES).default("COLABORADOR"),
});

export const updateUserSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  papel: z.enum(GLOBAL_ROLES).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
