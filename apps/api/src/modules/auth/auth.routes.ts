import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { authGuard } from "../../middleware/auth";
import * as authService from "./auth.service";
import { changePasswordSchema, loginSchema, refreshSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logout(refreshToken);
    res.status(204).send();
  }),
);

authRouter.get(
  "/me",
  authGuard,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

authRouter.patch(
  "/password",
  authGuard,
  asyncHandler(async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    res.json(await authService.changePassword(req.user!.id, input));
  }),
);
