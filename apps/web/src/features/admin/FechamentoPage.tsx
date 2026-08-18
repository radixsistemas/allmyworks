import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullPageSpinner, Spinner } from "../../components/ui/Spinner";
import {
  useFecharPeriodo,
  useFechamentos,
  usePreviewFechamento,
  useProximoPeriodo,
  useReabrirFechamento,
} from "../../hooks/useFechamentos";
import { getApiErrorMessage } from "../../lib/api";
import { formatData, formatMoeda } from "../../lib/format";

export function FechamentoPage() {
  const { data: proximoPeriodo } = useProximoPeriodo();
  const { data: fechamentos, isLoading: carregandoFechamentos } = useFechamentos();
  const fecharPeriodo = useFecharPeriodo();
  const reabrirFechamento = useReabrirFechamento();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proximoPeriodo) return;
    setDataInicio(proximoPeriodo.inicio.slice(0, 10));
    setDataFim(proximoPeriodo.fim.slice(0, 10));
    setCompetencia(proximoPeriodo.competencia);
  }, [proximoPeriodo]);

  const { data: preview, isLoading: carregandoPreview } = usePreviewFechamento(dataInicio, dataFim);

  async function handleFechar() {
    setError(null);
    if (!window.confirm(`Fechar o período de ${formatData(dataInicio)} a ${formatData(dataFim)} (competência ${competencia})? Os lançamentos deste intervalo ficarão travados para os colaboradores.`)) {
      return;
    }
    try {
      await fecharPeriodo.mutateAsync({ dataInicio, dataFim, competencia });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleReabrir(id: string) {
    if (!window.confirm("Reabrir este fechamento? Os lançamentos voltarão a ficar editáveis pelos colaboradores.")) return;
    try {
      await reabrirFechamento.mutateAsync(id);
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Fechamento de período</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todo período vai do dia 21 de um mês até o dia 20 do mês seguinte.
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Data início" required>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </Field>
          <Field label="Data fim" required>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </Field>
          <Field label="Competência" required>
            <Input value={competencia} onChange={(e) => setCompetencia(e.target.value)} placeholder="Ex: Julho/2026" />
          </Field>
        </div>

        <div className="mt-5">
          {carregandoPreview ? (
            <Spinner />
          ) : !preview || preview.quantidadeLancamentos === 0 ? (
            <EmptyState title="Nenhum lançamento neste intervalo" />
          ) : (
            <div className="space-y-4">
              {preview.porUsuario.map((grupo) => (
                <div key={grupo.usuario.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{grupo.usuario.nome}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoeda(grupo.total)}</p>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {grupo.lancamentos.map((l) => (
                      <li key={l.id}>
                        {l.projeto.nome} · {l.tipoTrabalho.nome} · {Number(l.quantidade)} × {formatMoeda(l.valorUnitario)} ={" "}
                        {formatMoeda(l.valorTotal)} · entrega {formatData(l.dataEntrega)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">{preview.quantidadeLancamentos} lançamento(s)</p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Total geral: {formatMoeda(preview.totalGeral)}
                </p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleFechar}
            disabled={fecharPeriodo.isPending || !dataInicio || !dataFim || !competencia}
          >
            {fecharPeriodo.isPending ? "Fechando..." : "Fechar período"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Histórico de fechamentos</h2>
        {carregandoFechamentos || !fechamentos ? (
          <FullPageSpinner />
        ) : fechamentos.length === 0 ? (
          <EmptyState title="Nenhum fechamento realizado ainda" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Competência</th>
                  <th className="py-2 pr-3">Período</th>
                  <th className="py-2 pr-3">Fechado por</th>
                  <th className="py-2 pr-3">Em</th>
                  <th className="py-2 pr-3">Lançamentos</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3" />
                </tr>
              </thead>
              <tbody>
                {fechamentos.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 dark:border-slate-900">
                    <td className="py-2 pr-3">{f.competencia}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatData(f.dataInicio)} – {formatData(f.dataFim)}
                    </td>
                    <td className="py-2 pr-3">{f.fechadoPor.nome}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatData(f.fechadoEm)}</td>
                    <td className="py-2 pr-3">{f._count.lancamentos}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={f.reaberto ? "amber" : "green"}>{f.reaberto ? "Reaberto" : "Fechado"}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      {!f.reaberto && (
                        <Button size="sm" variant="ghost" onClick={() => handleReabrir(f.id)}>
                          Reabrir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
