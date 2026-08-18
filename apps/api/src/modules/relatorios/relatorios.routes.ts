import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as relatoriosService from "./relatorios.service";
import { gerarRelatorioPdf, gerarRelatorioXlsx } from "./relatorios.export";
import { relatorioQuerySchema } from "./relatorios.schemas";

export const relatoriosRouter = Router();
relatoriosRouter.use(authGuard, requireAdmin);

function nomeArquivoSeguro(competencia: string): string {
  return competencia.replace(/[^\p{L}\p{N}]+/gu, "-");
}

relatoriosRouter.get(
  "/pagamentos",
  asyncHandler(async (req, res) => {
    const filters = relatorioQuerySchema.parse(req.query);
    res.json(await relatoriosService.getRelatorioPagamentos(filters));
  }),
);

relatoriosRouter.get(
  "/pagamentos/export.pdf",
  asyncHandler(async (req, res) => {
    const filters = relatorioQuerySchema.parse(req.query);
    const relatorio = await relatoriosService.getRelatorioPagamentos(filters);
    const buffer = await gerarRelatorioPdf(relatorio);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="relatorio-${nomeArquivoSeguro(filters.competencia)}.pdf"`);
    res.send(buffer);
  }),
);

relatoriosRouter.get(
  "/pagamentos/export.xlsx",
  asyncHandler(async (req, res) => {
    const filters = relatorioQuerySchema.parse(req.query);
    const relatorio = await relatoriosService.getRelatorioPagamentos(filters);
    const buffer = await gerarRelatorioXlsx(relatorio);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="relatorio-${nomeArquivoSeguro(filters.competencia)}.xlsx"`);
    res.send(buffer);
  }),
);
