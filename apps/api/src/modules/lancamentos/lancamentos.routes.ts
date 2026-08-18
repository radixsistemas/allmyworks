import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard } from "../../middleware/auth";
import * as lancamentosService from "./lancamentos.service";
import { createLancamentoSchema, listLancamentosQuerySchema, updateLancamentoSchema } from "./lancamentos.schemas";

export const lancamentosRouter = Router();
lancamentosRouter.use(authGuard);

lancamentosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = listLancamentosQuerySchema.parse(req.query);
    res.json(await lancamentosService.listLancamentos(req.user!, filters));
  }),
);

lancamentosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createLancamentoSchema.parse(req.body);
    res.status(201).json(await lancamentosService.createLancamento(req.user!, input));
  }),
);

lancamentosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = updateLancamentoSchema.parse(req.body);
    res.json(await lancamentosService.updateLancamento(req.user!, req.params.id, input));
  }),
);

lancamentosRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await lancamentosService.deleteLancamento(req.user!, req.params.id);
    res.status(204).send();
  }),
);
