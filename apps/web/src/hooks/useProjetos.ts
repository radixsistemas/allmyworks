import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjetoStatus } from "@allmyworks/shared";
import { api } from "../lib/api";
import type { Projeto } from "../types/api";

export function useProjetos(filters: { status?: ProjetoStatus } = {}) {
  return useQuery({
    queryKey: ["projetos", filters],
    queryFn: async () => (await api.get<Projeto[]>("/projetos", { params: filters })).data,
  });
}

function invalidateProjetos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["projetos"] });
}

export function useCreateProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string }) => (await api.post<Projeto>("/projetos", input)).data,
    onSuccess: () => invalidateProjetos(qc),
  });
}

export function useUpdateProjeto(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome?: string; status?: ProjetoStatus }) =>
      (await api.patch<Projeto>(`/projetos/${id}`, input)).data,
    onSuccess: () => invalidateProjetos(qc),
  });
}
