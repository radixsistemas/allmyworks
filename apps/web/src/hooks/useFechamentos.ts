import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Fechamento, Periodo, PreviewFechamento } from "../types/api";

export function useFechamentos() {
  return useQuery({
    queryKey: ["fechamentos"],
    queryFn: async () => (await api.get<Fechamento[]>("/fechamentos")).data,
  });
}

export function useProximoPeriodo() {
  return useQuery({
    queryKey: ["fechamentos", "proximo-periodo"],
    queryFn: async () => (await api.get<Periodo>("/fechamentos/proximo-periodo")).data,
  });
}

export function usePreviewFechamento(dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ["fechamentos", "preview", dataInicio, dataFim],
    queryFn: async () =>
      (await api.get<PreviewFechamento>("/fechamentos/preview", { params: { dataInicio, dataFim } })).data,
    enabled: !!dataInicio && !!dataFim,
  });
}

function invalidateFechamentos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["fechamentos"] });
  qc.invalidateQueries({ queryKey: ["lancamentos"] });
}

export function useFecharPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { dataInicio: string; dataFim: string; competencia: string }) =>
      (await api.post<Fechamento>("/fechamentos", input)).data,
    onSuccess: () => invalidateFechamentos(qc),
  });
}

export function useReabrirFechamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<Fechamento>(`/fechamentos/${id}/reabrir`)).data,
    onSuccess: () => invalidateFechamentos(qc),
  });
}
