import type { NextFunction, Request, Response } from "express";
import type { GlobalRole, UserStatus } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt";
import { HttpError } from "../lib/http-error";
import { prisma } from "../lib/prisma";

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  papel: GlobalRole;
  status: UserStatus;
  senhaTemporaria: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(HttpError.unauthorized());
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(HttpError.unauthorized());
    if (user.status === "BLOQUEADO") return next(HttpError.unauthorized("Usuário bloqueado"));
    if (user.status === "ARQUIVADO") return next(HttpError.unauthorized("Usuário arquivado"));

    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      status: user.status,
      senhaTemporaria: user.senhaTemporaria,
    };
    next();
  } catch {
    next(HttpError.unauthorized("Token de acesso inválido ou expirado"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.papel !== "ADMIN") return next(HttpError.forbidden("Apenas administradores podem realizar esta ação"));
  next();
}
