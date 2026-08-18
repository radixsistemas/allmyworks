export const GLOBAL_ROLES = ["ADMIN", "COLABORADOR"] as const;
export type GlobalRole = (typeof GLOBAL_ROLES)[number];

export const USER_STATUSES = ["ATIVO", "BLOQUEADO", "ARQUIVADO"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PROJETO_STATUSES = ["ATIVO", "INATIVO"] as const;
export type ProjetoStatus = (typeof PROJETO_STATUSES)[number];

export const MODALIDADES_REMUNERACAO = ["FIXO_POR_TRABALHO", "FIXO_POR_UNIDADE", "LIVRE"] as const;
export type ModalidadeRemuneracao = (typeof MODALIDADES_REMUNERACAO)[number];

export const LANCAMENTO_STATUSES = ["ABERTO", "FECHADO"] as const;
export type LancamentoStatus = (typeof LANCAMENTO_STATUSES)[number];

export const AUDITORIA_ACOES = ["FECHAMENTO", "REABERTURA", "EDICAO_POS_FECHAMENTO"] as const;
export type AuditoriaAcao = (typeof AUDITORIA_ACOES)[number];

export const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  ADMIN: "Administrador",
  COLABORADOR: "Colaborador",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ATIVO: "Ativo",
  BLOQUEADO: "Bloqueado",
  ARQUIVADO: "Arquivado",
};

export const PROJETO_STATUS_LABELS: Record<ProjetoStatus, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const MODALIDADE_REMUNERACAO_LABELS: Record<ModalidadeRemuneracao, string> = {
  FIXO_POR_TRABALHO: "Valor fixo por trabalho",
  FIXO_POR_UNIDADE: "Valor fixo por página/lauda (unidade)",
  LIVRE: "Valor livre (informado no lançamento)",
};

export const LANCAMENTO_STATUS_LABELS: Record<LancamentoStatus, string> = {
  ABERTO: "Aberto",
  FECHADO: "Fechado",
};
