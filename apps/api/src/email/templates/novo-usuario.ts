import { wrapEmail } from "./layout";
import { env } from "../../config/env";

export function novoUsuarioEmail(nome: string, email: string, senhaTemporaria: string): { subject: string; html: string } {
  const html = wrapEmail(
    "Sua conta foi criada",
    `
      <p>Olá, ${nome}!</p>
      <p>Uma conta foi criada para você no sistema de lançamento de trabalhos da editora.</p>
      <p>
        <strong>E-mail:</strong> ${email}<br/>
        <strong>Senha temporária:</strong> ${senhaTemporaria}
      </p>
      <p>No primeiro acesso você será solicitado a trocar essa senha.</p>
      <p><a href="${env.APP_BASE_URL}/login" style="color:#2563eb;">Acessar o sistema</a></p>
    `,
  );
  return { subject: "Sua conta foi criada", html };
}
