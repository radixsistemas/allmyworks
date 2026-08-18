import { transporter } from "./transport";
import { env } from "../config/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia e-mail via SMTP configurado no .env. Com EMAIL_DRY_RUN=true (padrão em dev),
 * o e-mail só é logado no console.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (env.EMAIL_DRY_RUN) {
    console.log(`[email:dry-run] para=${input.to} assunto="${input.subject}"`);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
