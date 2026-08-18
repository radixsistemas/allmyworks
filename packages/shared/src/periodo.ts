/**
 * Regra de período de fechamento: todo período vai do dia 21 de um mês até o
 * dia 20 do mês seguinte. A competência é o mês/ano em que o período termina
 * (ex.: período 21/06 a 20/07 -> competência "Julho/2026").
 *
 * Datas são tratadas como "apenas data" (sem hora), sempre em UTC, para que o
 * cálculo não varie conforme o fuso horário do servidor/navegador.
 */

const MES_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export interface Periodo {
  inicio: Date;
  fim: Date;
  competenciaMes: number;
  competenciaAno: number;
  competencia: string;
}

function toUtcDateOnly(data: Date | string): Date {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatCompetencia(mes: number, ano: number): string {
  return `${MES_LABELS[mes - 1]}/${ano}`;
}

/** Dado um dia (1-12 para mês, ano), retorna o mês/ano da competência (mês 1-12). */
function normalizeMonth(mes: number, ano: number): { mes: number; ano: number } {
  let m = mes;
  let a = ano;
  while (m > 12) {
    m -= 12;
    a += 1;
  }
  while (m < 1) {
    m += 12;
    a -= 1;
  }
  return { mes: m, ano: a };
}

/** Calcula o período (21 a 20) e a competência a que uma data de entrega pertence. */
export function computePeriodo(dataEntrega: Date | string): Periodo {
  const d = toUtcDateOnly(dataEntrega);
  const dia = d.getUTCDate();
  const mes = d.getUTCMonth() + 1; // 1-12
  const ano = d.getUTCFullYear();

  let inicioMes: number;
  let inicioAno: number;
  let competenciaMes: number;
  let competenciaAno: number;

  if (dia >= 21) {
    inicioMes = mes;
    inicioAno = ano;
    const comp = normalizeMonth(mes + 1, ano);
    competenciaMes = comp.mes;
    competenciaAno = comp.ano;
  } else {
    const inicio = normalizeMonth(mes - 1, ano);
    inicioMes = inicio.mes;
    inicioAno = inicio.ano;
    competenciaMes = mes;
    competenciaAno = ano;
  }

  const inicio = new Date(Date.UTC(inicioAno, inicioMes - 1, 21));
  const fimBase = normalizeMonth(inicioMes + 1, inicioAno);
  const fim = new Date(Date.UTC(fimBase.ano, fimBase.mes - 1, 20));

  return {
    inicio,
    fim,
    competenciaMes,
    competenciaAno,
    competencia: formatCompetencia(competenciaMes, competenciaAno),
  };
}

/** Dado o início de um período (dia 21), retorna o período seguinte. */
export function proximoPeriodo(periodoInicioAtual: Date | string): Periodo {
  const d = toUtcDateOnly(periodoInicioAtual);
  const proximoMes = normalizeMonth(d.getUTCMonth() + 1 + 1, d.getUTCFullYear());
  return computePeriodo(new Date(Date.UTC(proximoMes.ano, proximoMes.mes - 1, 21)));
}

export function formatDateOnly(data: Date | string): string {
  const d = toUtcDateOnly(data);
  return d.toISOString().slice(0, 10);
}
