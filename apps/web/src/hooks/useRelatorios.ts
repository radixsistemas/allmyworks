import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { RelatorioPagamentos } from "../types/api";

export interface RelatorioFilters {
  competencia: string;
  usuarioId?: string;
  projetoId?: string;
  tipoTrabalhoId?: string;
}

export function useRelatorioPagamentos(filters: RelatorioFilters | undefined) {
  return useQuery({
    queryKey: ["relatorio-pagamentos", filters],
    queryFn: async () => (await api.get<RelatorioPagamentos>("/relatorios/pagamentos", { params: filters })).data,
    enabled: !!filters?.competencia,
  });
}

export async function baixarRelatorio(formato: "pdf" | "xlsx", filters: RelatorioFilters): Promise<void> {
  const response = await api.get(`/relatorios/pagamentos/export.${formato}`, {
    params: filters,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  const nomeSeguro = filters.competencia.replace(/[^\p{L}\p{N}]+/gu, "-");
  link.download = `relatorio-${nomeSeguro}.${formato}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
