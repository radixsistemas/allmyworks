import { computePeriodo } from "@allmyworks/shared";
import { prisma } from "../../lib/prisma";

const CONFIG_ID = "default";

/** Garante que exista uma linha de configuração, sugerindo o período atual como ponto de partida. */
export async function getConfiguracao() {
  let config = await prisma.configuracaoSistema.findUnique({ where: { id: CONFIG_ID } });
  if (!config) {
    const periodoAtual = computePeriodo(new Date());
    config = await prisma.configuracaoSistema.create({
      data: { id: CONFIG_ID, proximoPeriodoInicio: periodoAtual.inicio },
    });
  }
  return config;
}

export async function setProximoPeriodoInicio(proximoPeriodoInicio: Date) {
  return prisma.configuracaoSistema.upsert({
    where: { id: CONFIG_ID },
    update: { proximoPeriodoInicio },
    create: { id: CONFIG_ID, proximoPeriodoInicio },
  });
}
