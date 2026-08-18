/** Campos públicos de um usuário — nunca inclua senhaHash em respostas da API. */
export const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  status: true,
} as const;
