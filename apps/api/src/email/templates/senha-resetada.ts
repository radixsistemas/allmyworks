import { wrapEmail } from "./layout";
import { env } from "../../config/env";

export function senhaResetadaEmail(nome: string, senhaTemporaria: string): { subject: string; html: string } {
  const html = wrapEmail(
    "Sua senha foi redefinida",
    `
      <p>Olá, ${nome}!</p>
      <p>Sua senha de acesso ao sistema de lançamento de trabalhos foi redefinida por um administrador.</p>
      <p><strong>Nova senha temporária:</strong> ${senhaTemporaria}</p>
      <p>No próximo acesso você será solicitado a trocar essa senha.</p>
      <p><a href="${env.APP_BASE_URL}/login" style="color:#2563eb;">Acessar o sistema</a></p>
    `,
  );
  return { subject: "Sua senha foi redefinida", html };
}
