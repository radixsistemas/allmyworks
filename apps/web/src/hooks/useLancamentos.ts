import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Lancamento } from "../types/api";

export interface LancamentoFilters {
  usuarioId?: string;
  projetoId?: string;
  tipoTrabalhoId?: string;
  competencia?: string;
  status?: "ABERTO" | "FECHADO";
}

export function useLancamentos(filters: LancamentoFilters = {}) {
  return useQuery({
    queryKey: ["lancamentos", filters],
    queryFn: async () => (await api.get<Lancamento[]>("/lancamentos", { params: filters })).data,
  });
}

function invalidateLancamentos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["lancamentos"] });
}

export interface LancamentoInput {
  projetoId: string;
  tipoTrabalhoId: string;
  descricao?: string;
  quantidade: number;
  dataEntrega: string;
  valorUnitario?: number;
  linkEntrega?: string;
}

export function useCreateLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LancamentoInput) => (await api.post<Lancamento>("/lancamentos", input)).data,
    onSuccess: () => invalidateLancamentos(qc),
  });
}

export function useUpdateLancamento(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<LancamentoInput>) => (await api.patch<Lancamento>(`/lancamentos/${id}`, input)).data,
    onSuccess: () => invalidateLancamentos(qc),
  });
}

export function useDeleteLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/lancamentos/${id}`),
    onSuccess: () => invalidateLancamentos(qc),
  });
}
