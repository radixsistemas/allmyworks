import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),

  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET deve ter pelo menos 16 caracteres"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET deve ter pelo menos 16 caracteres"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  EMAIL_FROM: z.string().default("Editora <notificacoes@example.com>"),
  EMAIL_DRY_RUN: z.coerce.boolean().default(true),

  CLOSING_REMINDER_CRON: z.string().default("0 13 18 * *"),

  APP_BASE_URL: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variáveis de ambiente inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
