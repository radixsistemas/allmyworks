import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Erro interno do servidor",
    details: env.NODE_ENV === "development" ? String(err) : undefined,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}
