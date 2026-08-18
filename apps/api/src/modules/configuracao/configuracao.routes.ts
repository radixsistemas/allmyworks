import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as configuracaoService from "./configuracao.service";
import { updateConfiguracaoSchema } from "./configuracao.schemas";

export const configuracaoRouter = Router();
configuracaoRouter.use(authGuard, requireAdmin);

configuracaoRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await configuracaoService.getConfiguracao());
  }),
);

configuracaoRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const input = updateConfiguracaoSchema.parse(req.body);
    res.json(await configuracaoService.setProximoPeriodoInicio(input.proximoPeriodoInicio));
  }),
);
