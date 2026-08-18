import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computePeriodo } from "@allmyworks/shared";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding banco de dados de exemplo...");

  await prisma.auditLog.deleteMany();
  await prisma.lancamento.deleteMany();
  await prisma.fechamento.deleteMany();
  await prisma.regraRemuneracao.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.configuracaoSistema.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tipoTrabalho.deleteMany();
  await prisma.projeto.deleteMany();

  const senhaHash = await hash("senha123");

  const admin = await prisma.user.create({
    data: {
      nome: "Ana Administradora",
      email: "admin@example.com",
      senhaHash,
      papel: "ADMIN",
      status: "ATIVO",
      senhaTemporaria: false,
    },
  });

  const designer = await prisma.user.create({
    data: {
      nome: "Diego Designer",
      email: "diego@example.com",
      senhaHash,
      papel: "COLABORADOR",
      status: "ATIVO",
      senhaTemporaria: false,
    },
  });

  const revisora = await prisma.user.create({
    data: {
      nome: "Renata Revisora",
      email: "renata@example.com",
      senhaHash,
      papel: "COLABORADOR",
      status: "ATIVO",
      senhaTemporaria: false,
    },
  });

  const projetoLivro1 = await prisma.projeto.create({ data: { nome: "Coleção Raízes — Vol. 1", status: "ATIVO" } });
  const projetoLivro2 = await prisma.projeto.create({ data: { nome: "Manual de Estilo Editorial", status: "ATIVO" } });
  await prisma.projeto.create({ data: { nome: "Projeto encerrado 2025", status: "INATIVO" } });

  const tipoCapa = await prisma.tipoTrabalho.create({ data: { nome: "Capa", unidadePadrao: "trabalho", ativo: true } });
  const tipoDiagramacao = await prisma.tipoTrabalho.create({
    data: { nome: "Diagramação", unidadePadrao: "página", ativo: true },
  });
  const tipoRevisao = await prisma.tipoTrabalho.create({ data: { nome: "Revisão", unidadePadrao: "lauda", ativo: true } });
  const tipoPreparacao = await prisma.tipoTrabalho.create({
    data: { nome: "Preparação de texto", unidadePadrao: "lauda", ativo: true },
  });

  await prisma.regraRemuneracao.createMany({
    data: [
      { usuarioId: designer.id, tipoTrabalhoId: tipoCapa.id, modalidade: "FIXO_POR_TRABALHO", valorUnitario: 400 },
      { usuarioId: designer.id, tipoTrabalhoId: tipoDiagramacao.id, modalidade: "FIXO_POR_UNIDADE", valorUnitario: 2.5 },
      { usuarioId: revisora.id, tipoTrabalhoId: tipoRevisao.id, modalidade: "FIXO_POR_UNIDADE", valorUnitario: 3 },
      { usuarioId: revisora.id, tipoTrabalhoId: tipoPreparacao.id, modalidade: "LIVRE" },
    ],
  });

  const hoje = new Date();
  const dataEntregaExemplo = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), Math.min(hoje.getUTCDate(), 15)));
  const periodo = computePeriodo(dataEntregaExemplo);

  await prisma.lancamento.create({
    data: {
      usuarioId: designer.id,
      projetoId: projetoLivro1.id,
      tipoTrabalhoId: tipoDiagramacao.id,
      descricao: "Diagramação dos capítulos 1 a 6",
      quantidade: 120,
      dataEntrega: dataEntregaExemplo,
      valorUnitario: 2.5,
      valorTotal: 300,
      linkEntrega: "https://drive.example.com/diagramacao-cap1-6",
      competencia: periodo.competencia,
      periodoInicio: periodo.inicio,
      periodoFim: periodo.fim,
      status: "ABERTO",
    },
  });

  await prisma.lancamento.create({
    data: {
      usuarioId: designer.id,
      projetoId: projetoLivro2.id,
      tipoTrabalhoId: tipoCapa.id,
      descricao: "Capa e contracapa",
      quantidade: 1,
      dataEntrega: dataEntregaExemplo,
      valorUnitario: 400,
      valorTotal: 400,
      linkEntrega: "https://drive.example.com/capa-manual-estilo",
      competencia: periodo.competencia,
      periodoInicio: periodo.inicio,
      periodoFim: periodo.fim,
      status: "ABERTO",
    },
  });

  await prisma.lancamento.create({
    data: {
      usuarioId: revisora.id,
      projetoId: projetoLivro1.id,
      tipoTrabalhoId: tipoRevisao.id,
      descricao: "Revisão ortográfica dos capítulos 1 a 6",
      quantidade: 80,
      dataEntrega: dataEntregaExemplo,
      valorUnitario: 3,
      valorTotal: 240,
      linkEntrega: "https://drive.example.com/revisao-cap1-6",
      competencia: periodo.competencia,
      periodoInicio: periodo.inicio,
      periodoFim: periodo.fim,
      status: "ABERTO",
    },
  });

  await prisma.configuracaoSistema.create({
    data: { id: "default", proximoPeriodoInicio: periodo.inicio },
  });

  console.log("Seed concluído.");
  console.log(`Usuário admin: ${admin.email} / senha123`);
  console.log("Demais usuários de teste (mesma senha): diego@example.com, renata@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
