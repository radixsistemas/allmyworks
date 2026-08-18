import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as fechamentosService from "./fechamentos.service";
import { fecharPeriodoSchema, previewQuerySchema } from "./fechamentos.schemas";

export const fechamentosRouter = Router();
fechamentosRouter.use(authGuard, requireAdmin);

fechamentosRouter.get(
  "/proximo-periodo",
  asyncHandler(async (_req, res) => {
    res.json(await fechamentosService.sugerirProximoPeriodo());
  }),
);

fechamentosRouter.get(
  "/preview",
  asyncHandler(async (req, res) => {
    const filters = previewQuerySchema.parse(req.query);
    res.json(await fechamentosService.previewFechamento(filters));
  }),
);

fechamentosRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await fechamentosService.listFechamentos());
  }),
);

fechamentosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = fecharPeriodoSchema.parse(req.body);
    res.status(201).json(await fechamentosService.fecharPeriodo(req.user!, input));
  }),
);

fechamentosRouter.post(
  "/:id/reabrir",
  asyncHandler(async (req, res) => {
    res.json(await fechamentosService.reabrirFechamento(req.user!, req.params.id));
  }),
);
