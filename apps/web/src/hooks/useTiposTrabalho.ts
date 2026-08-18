import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { TipoTrabalho } from "../types/api";

export function useTiposTrabalho(filters: { ativo?: boolean } = {}) {
  return useQuery({
    queryKey: ["tipos-trabalho", filters],
    queryFn: async () => (await api.get<TipoTrabalho[]>("/tipos-trabalho", { params: filters })).data,
  });
}

function invalidateTiposTrabalho(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["tipos-trabalho"] });
}

export function useCreateTipoTrabalho() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome: string; unidadePadrao?: string }) =>
      (await api.post<TipoTrabalho>("/tipos-trabalho", input)).data,
    onSuccess: () => invalidateTiposTrabalho(qc),
  });
}

export function useUpdateTipoTrabalho(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nome?: string; unidadePadrao?: string; ativo?: boolean }) =>
      (await api.patch<TipoTrabalho>(`/tipos-trabalho/${id}`, input)).data,
    onSuccess: () => invalidateTiposTrabalho(qc),
  });
}
