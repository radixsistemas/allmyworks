import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Configuracao } from "../types/api";

export function useConfiguracao() {
  return useQuery({
    queryKey: ["configuracao"],
    queryFn: async () => (await api.get<Configuracao>("/configuracao")).data,
  });
}

export function useUpdateConfiguracao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proximoPeriodoInicio: string) =>
      (await api.put<Configuracao>("/configuracao", { proximoPeriodoInicio })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["configuracao"] });
      qc.invalidateQueries({ queryKey: ["fechamentos", "proximo-periodo"] });
    },
  });
}
