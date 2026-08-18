import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import type { RelatorioPagamentos } from "./relatorios.service";

function formatMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatData(data: Date): string {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export async function gerarRelatorioPdf(relatorio: RelatorioPagamentos): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(16).text("Relatório de pagamentos", { align: "left" });
  doc.fontSize(11).fillColor("#555").text(`Competência: ${relatorio.competencia}`);
  doc.text(relatorio.fechada ? "Status: período fechado (valores travados)" : "Status: período em aberto — valores podem mudar");
  doc.moveDown();
  doc.fillColor("#000");

  for (const grupo of relatorio.porUsuario) {
    doc.moveDown(0.5);
    doc.fontSize(13).text(grupo.usuario.nome, { underline: true });
    doc.fontSize(9).fillColor("#555").text(grupo.usuario.email);
    doc.fillColor("#000");
    doc.moveDown(0.3);

    for (const lancamento of grupo.lancamentos) {
      const linha = `${lancamento.projeto.nome} | ${lancamento.tipoTrabalho.nome} | ${Number(lancamento.quantidade)} ${lancamento.tipoTrabalho.unidadePadrao ?? "un."} | ${formatMoeda(Number(lancamento.valorUnitario))} | ${formatMoeda(Number(lancamento.valorTotal))} | entrega ${formatData(lancamento.dataEntrega)}`;
      doc.fontSize(9).text(linha, { indent: 10 });
      if (lancamento.descricao) {
        doc.fontSize(8).fillColor("#777").text(lancamento.descricao, { indent: 20 });
        doc.fillColor("#000");
      }
    }

    doc.moveDown(0.2);
    doc.fontSize(10).text(`Total ${grupo.usuario.nome}: ${formatMoeda(grupo.total)}`, { align: "right" });
  }

  doc.moveDown();
  doc.fontSize(13).text(`Total geral da competência: ${formatMoeda(relatorio.totalGeral)}`, { align: "right" });

  doc.end();
  return done;
}

export async function gerarRelatorioXlsx(relatorio: RelatorioPagamentos): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const nomePlanilha = `Pagamentos ${relatorio.competencia}`.replace(/[*?:\\/[\]]/g, "-").slice(0, 31);
  const sheet = workbook.addWorksheet(nomePlanilha);

  sheet.columns = [
    { header: "Colaborador", key: "colaborador", width: 24 },
    { header: "Projeto", key: "projeto", width: 22 },
    { header: "Tipo de trabalho", key: "tipo", width: 20 },
    { header: "Descrição", key: "descricao", width: 30 },
    { header: "Quantidade", key: "quantidade", width: 12 },
    { header: "Valor unitário", key: "valorUnitario", width: 16 },
    { header: "Valor total", key: "valorTotal", width: 16 },
    { header: "Data de entrega", key: "dataEntrega", width: 16 },
    { header: "Link da entrega", key: "linkEntrega", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const grupo of relatorio.porUsuario) {
    for (const lancamento of grupo.lancamentos) {
      sheet.addRow({
        colaborador: grupo.usuario.nome,
        projeto: lancamento.projeto.nome,
        tipo: lancamento.tipoTrabalho.nome,
        descricao: lancamento.descricao ?? "",
        quantidade: Number(lancamento.quantidade),
        valorUnitario: Number(lancamento.valorUnitario),
        valorTotal: Number(lancamento.valorTotal),
        dataEntrega: formatData(lancamento.dataEntrega),
        linkEntrega: lancamento.linkEntrega ?? "",
      });
    }
    const totalRow = sheet.addRow({ colaborador: `Total ${grupo.usuario.nome}`, valorTotal: grupo.total });
    totalRow.font = { bold: true };
  }

  sheet.addRow({});
  const totalGeralRow = sheet.addRow({ colaborador: "Total geral da competência", valorTotal: relatorio.totalGeral });
  totalGeralRow.font = { bold: true };

  sheet.getColumn("valorUnitario").numFmt = '"R$" #,##0.00';
  sheet.getColumn("valorTotal").numFmt = '"R$" #,##0.00';

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
