import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as regrasService from "./regras-remuneracao.service";
import { putRegrasUsuarioSchema } from "./regras-remuneracao.schemas";

export const regrasRemuneracaoRouter = Router();
regrasRemuneracaoRouter.use(authGuard);

regrasRemuneracaoRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await regrasService.getRegrasParaLancamento(req.user!.id));
  }),
);

regrasRemuneracaoRouter.get(
  "/usuarios/:usuarioId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await regrasService.listRegrasPorUsuario(req.params.usuarioId));
  }),
);

regrasRemuneracaoRouter.put(
  "/usuarios/:usuarioId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = putRegrasUsuarioSchema.parse(req.body);
    res.json(await regrasService.setRegrasUsuario(req.params.usuarioId, input));
  }),
);
