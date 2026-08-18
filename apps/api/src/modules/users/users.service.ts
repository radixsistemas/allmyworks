import type { User, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";
import { hashPassword, generateTemporaryPassword } from "../../lib/password";
import { sendEmail } from "../../email/mailer";
import { novoUsuarioEmail } from "../../email/templates/novo-usuario";
import { senhaResetadaEmail } from "../../email/templates/senha-resetada";
import type { CreateUserInput, UpdateUserInput } from "./users.schemas";

function sanitizeUser(user: User) {
  const { senhaHash: _senhaHash, ...rest } = user;
  return rest;
}

export async function listUsers(filters: { status?: UserStatus }) {
  const users = await prisma.user.findMany({
    where: filters.status ? { status: filters.status } : { status: { in: ["ATIVO", "BLOQUEADO"] } },
    orderBy: { nome: "asc" },
  });
  return users.map(sanitizeUser);
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw HttpError.notFound("Usuário não encontrado");
  return sanitizeUser(user);
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.notFound("Usuário não encontrado");
  return sanitizeUser(user);
}

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw HttpError.conflict("Já existe um usuário com este e-mail");

  const senhaTemporaria = generateTemporaryPassword();
  const senhaHash = await hashPassword(senhaTemporaria);

  const user = await prisma.user.create({
    data: {
      nome: input.nome,
      email: input.email,
      papel: input.papel,
      senhaHash,
      senhaTemporaria: true,
    },
  });

  const { subject, html } = novoUsuarioEmail(user.nome, user.email, senhaTemporaria);
  await sendEmail({ to: user.email, subject, html });

  return sanitizeUser(user);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Usuário não encontrado");

  if (input.email && input.email !== existing.email) {
    const emailInUse = await prisma.user.findUnique({ where: { email: input.email } });
    if (emailInUse) throw HttpError.conflict("Já existe um usuário com este e-mail");
  }

  const updated = await prisma.user.update({ where: { id }, data: input });
  return sanitizeUser(updated);
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Usuário não encontrado");

  const updated = await prisma.user.update({ where: { id }, data: { status } });
  return sanitizeUser(updated);
}

export async function resetPassword(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw HttpError.notFound("Usuário não encontrado");

  const senhaTemporaria = generateTemporaryPassword();
  const senhaHash = await hashPassword(senhaTemporaria);

  const updated = await prisma.user.update({
    where: { id },
    data: { senhaHash, senhaTemporaria: true },
  });

  const { subject, html } = senhaResetadaEmail(updated.nome, senhaTemporaria);
  await sendEmail({ to: updated.email, subject, html });

  return sanitizeUser(updated);
}
