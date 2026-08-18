import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as tiposTrabalhoService from "./tipos-trabalho.service";
import {
  createTipoTrabalhoSchema,
  listTiposTrabalhoQuerySchema,
  updateTipoTrabalhoSchema,
} from "./tipos-trabalho.schemas";

export const tiposTrabalhoRouter = Router();
tiposTrabalhoRouter.use(authGuard);

tiposTrabalhoRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = listTiposTrabalhoQuerySchema.parse(req.query);
    res.json(await tiposTrabalhoService.listTiposTrabalho(filters));
  }),
);

tiposTrabalhoRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = createTipoTrabalhoSchema.parse(req.body);
    res.status(201).json(await tiposTrabalhoService.createTipoTrabalho(input));
  }),
);

tiposTrabalhoRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = updateTipoTrabalhoSchema.parse(req.body);
    res.json(await tiposTrabalhoService.updateTipoTrabalho(req.params.id, input));
  }),
);
