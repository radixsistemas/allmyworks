import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard, requireAdmin } from "../../middleware/auth";
import * as usersService from "./users.service";
import { createUserSchema, updateStatusSchema, updateUserSchema } from "./users.schemas";

export const usersRouter = Router();
usersRouter.use(authGuard);

usersRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await usersService.getUserProfile(req.user!.id));
  }),
);

usersRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = z.enum(["ATIVO", "BLOQUEADO", "ARQUIVADO"]).optional().parse(req.query.status);
    res.json(await usersService.listUsers({ status }));
  }),
);

usersRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    res.status(201).json(await usersService.createUser(input));
  }),
);

usersRouter.get(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await usersService.getUser(req.params.id));
  }),
);

usersRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = updateUserSchema.parse(req.body);
    res.json(await usersService.updateUser(req.params.id, input));
  }),
);

usersRouter.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = updateStatusSchema.parse(req.body);
    res.json(await usersService.updateUserStatus(req.params.id, status));
  }),
);

usersRouter.post(
  "/:id/reset-password",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json(await usersService.resetPassword(req.params.id));
  }),
);
