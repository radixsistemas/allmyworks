import type { User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { hashPassword, comparePassword } from "../../lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { hashToken } from "../../lib/token-hash";
import type { ChangePasswordInput, LoginInput } from "./auth.schemas";

async function issueTokenPair(userId: string) {
  const accessToken = signAccessToken(userId);
  const { token: refreshToken, expiresAt } = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(refreshToken), expiresAt },
  });

  return { accessToken, refreshToken };
}

function sanitizeUser(user: User) {
  const { senhaHash: _senhaHash, ...rest } = user;
  return rest;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw HttpError.unauthorized("E-mail ou senha inválidos");

  if (user.status === "BLOQUEADO") throw HttpError.unauthorized("Usuário bloqueado. Contate o administrador.");
  if (user.status === "ARQUIVADO") throw HttpError.unauthorized("Usuário arquivado. Contate o administrador.");

  const valid = await comparePassword(input.password, user.senhaHash);
  if (!valid) throw HttpError.unauthorized("E-mail ou senha inválidos");

  const tokens = await issueTokenPair(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refresh(refreshTokenInput: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenInput);
  } catch {
    throw HttpError.unauthorized("Refresh token inválido ou expirado");
  }

  const tokenHash = hashToken(refreshTokenInput);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw HttpError.unauthorized("Refresh token inválido ou expirado");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw HttpError.unauthorized("Usuário não encontrado");
  if (user.status !== "ATIVO") throw HttpError.unauthorized("Usuário sem acesso ao sistema");

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  const tokens = await issueTokenPair(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export async function logout(refreshTokenInput: string) {
  const tokenHash = hashToken(refreshTokenInput);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.notFound("Usuário não encontrado");

  const valid = await comparePassword(input.senhaAtual, user.senhaHash);
  if (!valid) throw HttpError.unauthorized("Senha atual incorreta");

  const senhaHash = await hashPassword(input.novaSenha);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { senhaHash, senhaTemporaria: false },
  });

  return sanitizeUser(updated);
}
