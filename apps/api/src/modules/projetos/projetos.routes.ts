import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as projetosService from "./projetos.service";
import { createProjetoSchema, listProjetosQuerySchema, updateProjetoSchema } from "./projetos.schemas";

export const projetosRouter = Router();
projetosRouter.use(authGuard);

projetosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = listProjetosQuerySchema.parse(req.query);
    res.json(await projetosService.listProjetos(filters));
  }),
);

projetosRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = createProjetoSchema.parse(req.body);
    res.status(201).json(await projetosService.createProjeto(input));
  }),
);

projetosRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = updateProjetoSchema.parse(req.body);
    res.json(await projetosService.updateProjeto(req.params.id, input));
  }),
);
