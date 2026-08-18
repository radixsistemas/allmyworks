import { computePeriodo, formatDateOnly } from "@allmyworks/shared";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../email/mailer";
import { lembreteFechamentoEmail } from "../email/templates/lembrete-fechamento";

/** Lembra colaboradores ativos de lançarem trabalhos pendentes antes do fechamento do período atual. */
export async function closingReminderJob() {
  const periodoAtual = computePeriodo(new Date());
  const dataFimFormatada = new Date(periodoAtual.fim).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  const colaboradores = await prisma.user.findMany({
    where: { papel: "COLABORADOR", status: "ATIVO" },
  });

  let enviados = 0;
  for (const colaborador of colaboradores) {
    const { subject, html } = lembreteFechamentoEmail(colaborador.nome, dataFimFormatada);
    await sendEmail({ to: colaborador.email, subject, html });
    enviados++;
  }

  return { periodo: formatDateOnly(periodoAtual.fim), colaboradores: colaboradores.length, enviados };
}
