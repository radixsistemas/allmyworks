import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken é obrigatório"),
});

export const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
