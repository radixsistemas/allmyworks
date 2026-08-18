import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { useUsers } from "../../hooks/useUsers";
import { useProjetos } from "../../hooks/useProjetos";
import { useTiposTrabalho } from "../../hooks/useTiposTrabalho";
import { useFechamentos, useProximoPeriodo } from "../../hooks/useFechamentos";
import { baixarRelatorio, useRelatorioPagamentos } from "../../hooks/useRelatorios";
import { getApiErrorMessage } from "../../lib/api";
import { formatData, formatMoeda } from "../../lib/format";

export function RelatorioPage() {
  const { data: fechamentos } = useFechamentos();
  const { data: proximoPeriodo } = useProximoPeriodo();
  const { data: users } = useUsers();
  const { data: projetos } = useProjetos();
  const { data: tipos } = useTiposTrabalho();

  const competencias = useMemo(() => {
    const set = new Set<string>();
    fechamentos?.forEach((f) => set.add(f.competencia));
    if (proximoPeriodo) set.add(proximoPeriodo.competencia);
    return Array.from(set);
  }, [fechamentos, proximoPeriodo]);

  const [competencia, setCompetencia] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [tipoTrabalhoId, setTipoTrabalhoId] = useState("");
  const [exportando, setExportando] = useState<"pdf" | "xlsx" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const filtros = competencia
    ? {
        competencia,
        usuarioId: usuarioId || undefined,
        projetoId: projetoId || undefined,
        tipoTrabalhoId: tipoTrabalhoId || undefined,
      }
    : undefined;

  const { data: relatorio, isLoading } = useRelatorioPagamentos(filtros);

  async function handleExport(formato: "pdf" | "xlsx") {
    if (!filtros) return;
    setExportError(null);
    setExportando(formato);
    try {
      await baixarRelatorio(formato, filtros);
    } catch (err) {
      setExportError(getApiErrorMessage(err));
    } finally {
      setExportando(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Relatório de pagamentos</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Base para o pagamento dos colaboradores, agrupado por usuário com detalhamento serviço por serviço.
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Competência" required>
            <Select value={competencia} onChange={(e) => setCompetencia(e.target.value)}>
              <option value="">Selecione...</option>
              {competencias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Colaborador">
            <Select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <option value="">Todos</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Projeto">
            <Select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
              <option value="">Todos</option>
              {projetos?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de trabalho">
            <Select value={tipoTrabalhoId} onChange={(e) => setTipoTrabalhoId(e.target.value)}>
              <option value="">Todos</option>
              {tipos?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      {!filtros ? (
        <EmptyState title="Selecione uma competência" description="Escolha a competência para gerar o relatório." />
      ) : isLoading || !relatorio ? (
        <Spinner />
      ) : relatorio.porUsuario.length === 0 ? (
        <EmptyState title="Nenhum lançamento nesta competência" />
      ) : (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Competência: {relatorio.competencia}</h2>
              <Badge tone={relatorio.fechada ? "green" : "amber"}>
                {relatorio.fechada ? "Período fechado" : "Período em aberto — valores podem mudar"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleExport("pdf")} disabled={exportando !== null}>
                {exportando === "pdf" ? "Gerando PDF..." : "Exportar PDF"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport("xlsx")} disabled={exportando !== null}>
                {exportando === "xlsx" ? "Gerando Excel..." : "Exportar Excel"}
              </Button>
            </div>
          </div>

          {exportError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{exportError}</p>}

          <div className="space-y-5">
            {relatorio.porUsuario.map((grupo) => (
              <div key={grupo.usuario.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{grupo.usuario.nome}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoeda(grupo.total)}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th className="py-1.5 pr-3">Projeto</th>
                        <th className="py-1.5 pr-3">Tipo</th>
                        <th className="py-1.5 pr-3">Descrição</th>
                        <th className="py-1.5 pr-3">Qtd.</th>
                        <th className="py-1.5 pr-3">Vlr. unit.</th>
                        <th className="py-1.5 pr-3">Vlr. total</th>
                        <th className="py-1.5 pr-3">Entrega</th>
                        <th className="py-1.5 pr-3">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.lancamentos.map((l) => (
                        <tr key={l.id} className="border-b border-slate-100 dark:border-slate-900">
                          <td className="py-1.5 pr-3">{l.projeto.nome}</td>
                          <td className="py-1.5 pr-3">{l.tipoTrabalho.nome}</td>
                          <td className="py-1.5 pr-3">{l.descricao ?? "—"}</td>
                          <td className="py-1.5 pr-3">{Number(l.quantidade)}</td>
                          <td className="py-1.5 pr-3 whitespace-nowrap">{formatMoeda(l.valorUnitario)}</td>
                          <td className="py-1.5 pr-3 whitespace-nowrap">{formatMoeda(l.valorTotal)}</td>
                          <td className="py-1.5 pr-3 whitespace-nowrap">{formatData(l.dataEntrega)}</td>
                          <td className="py-1.5 pr-3">
                            {l.linkEntrega ? (
                              <a href={l.linkEntrega} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline dark:text-brand-400">
                                abrir
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-200 pt-4 text-base font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            Total geral da competência: {formatMoeda(relatorio.totalGeral)}
          </div>
        </Card>
      )}
    </div>
  );
}
