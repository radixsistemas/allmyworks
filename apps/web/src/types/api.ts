import type {
  GlobalRole,
  UserStatus,
  ProjetoStatus,
  ModalidadeRemuneracao,
  LancamentoStatus,
} from "@allmyworks/shared";

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: GlobalRole;
  status: UserStatus;
  senhaTemporaria: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Projeto {
  id: string;
  nome: string;
  status: ProjetoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TipoTrabalho {
  id: string;
  nome: string;
  unidadePadrao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegraRemuneracao {
  id: string;
  usuarioId: string;
  tipoTrabalhoId: string;
  modalidade: ModalidadeRemuneracao;
  valorUnitario: string | null;
  ativo: boolean;
}

export interface RegraComTipo {
  tipoTrabalho: TipoTrabalho;
  regra: RegraRemuneracao | null;
}

export interface RegraParaLancamento {
  id: string;
  usuarioId: string;
  tipoTrabalhoId: string;
  modalidade: ModalidadeRemuneracao;
  valorUnitario: string | null;
  ativo: boolean;
  tipoTrabalho: TipoTrabalho;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
}

export interface Lancamento {
  id: string;
  usuarioId: string;
  projetoId: string;
  tipoTrabalhoId: string;
  descricao: string | null;
  quantidade: string;
  dataEntrega: string;
  valorUnitario: string;
  valorTotal: string;
  linkEntrega: string | null;
  competencia: string;
  periodoInicio: string;
  periodoFim: string;
  status: LancamentoStatus;
  fechamentoId: string | null;
  createdAt: string;
  updatedAt: string;
  usuario: UsuarioResumo;
  projeto: Projeto;
  tipoTrabalho: TipoTrabalho;
}

export interface Periodo {
  inicio: string;
  fim: string;
  competenciaMes: number;
  competenciaAno: number;
  competencia: string;
}

export interface Fechamento {
  id: string;
  dataInicio: string;
  dataFim: string;
  competencia: string;
  fechadoPorId: string;
  fechadoEm: string;
  reaberto: boolean;
  reabertoPorId: string | null;
  reabertoEm: string | null;
  fechadoPor: { id: string; nome: string };
  reabertoPor: { id: string; nome: string } | null;
  _count: { lancamentos: number };
}

export interface PreviewFechamento {
  lancamentos: Lancamento[];
  porUsuario: { usuario: UsuarioResumo; lancamentos: Lancamento[]; total: number }[];
  totalGeral: number;
  quantidadeLancamentos: number;
}

export interface RelatorioPorUsuario {
  usuario: UsuarioResumo;
  lancamentos: Lancamento[];
  total: number;
}

export interface RelatorioPagamentos {
  competencia: string;
  fechada: boolean;
  porUsuario: RelatorioPorUsuario[];
  totalGeral: number;
}

export interface Configuracao {
  id: string;
  proximoPeriodoInicio: string;
  updatedAt: string;
}
