import { wrapEmail } from "./layout";
import { env } from "../../config/env";

export function lembreteFechamentoEmail(nome: string, dataFimPeriodo: string): { subject: string; html: string } {
  const html = wrapEmail(
    "Lembrete: fechamento do período se aproxima",
    `
      <p>Olá, ${nome}!</p>
      <p>O período de lançamentos atual se encerra em <strong>${dataFimPeriodo}</strong>.</p>
      <p>Não esqueça de lançar seus trabalhos pendentes antes do fechamento.</p>
      <p><a href="${env.APP_BASE_URL}/lancamentos" style="color:#2563eb;">Lançar trabalhos</a></p>
    `,
  );
  return { subject: "Lembrete: fechamento do período se aproxima", html };
}
