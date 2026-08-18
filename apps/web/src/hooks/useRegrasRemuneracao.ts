import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ModalidadeRemuneracao } from "@allmyworks/shared";
import { api } from "../lib/api";
import type { RegraComTipo, RegraParaLancamento } from "../types/api";

export function useRegrasPorUsuario(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ["regras-remuneracao", "usuario", usuarioId],
    queryFn: async () => (await api.get<RegraComTipo[]>(`/regras-remuneracao/usuarios/${usuarioId}`)).data,
    enabled: !!usuarioId,
  });
}

export function useMinhasRegras() {
  return useQuery({
    queryKey: ["regras-remuneracao", "me"],
    queryFn: async () => (await api.get<RegraParaLancamento[]>("/regras-remuneracao/me")).data,
  });
}

export interface RegraItemInput {
  tipoTrabalhoId: string;
  modalidade: ModalidadeRemuneracao;
  valorUnitario?: number;
}

export function useSetRegrasUsuario(usuarioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (regras: RegraItemInput[]) =>
      (await api.put<RegraComTipo[]>(`/regras-remuneracao/usuarios/${usuarioId}`, { regras })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regras-remuneracao"] });
    },
  });
}
