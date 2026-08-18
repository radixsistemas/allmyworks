import { useState } from "react";
import { LANCAMENTO_STATUS_LABELS } from "@allmyworks/shared";
import type { LancamentoStatus } from "@allmyworks/shared";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useProjetos } from "../../hooks/useProjetos";
import { useTiposTrabalho } from "../../hooks/useTiposTrabalho";
import { useUsers } from "../../hooks/useUsers";
import { useDeleteLancamento, useLancamentos } from "../../hooks/useLancamentos";
import { getApiErrorMessage } from "../../lib/api";
import { formatData, formatMoeda } from "../../lib/format";
import { AdminLancamentoEditModal } from "./AdminLancamentoEditModal";
import type { Lancamento } from "../../types/api";

export function LancamentosAdminPage() {
  const { data: users } = useUsers();
  const { data: projetos } = useProjetos();
  const { data: tipos } = useTiposTrabalho();
  const deleteLancamento = useDeleteLancamento();

  const [usuarioId, setUsuarioId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [tipoTrabalhoId, setTipoTrabalhoId] = useState("");
  const [status, setStatus] = useState<LancamentoStatus | "">("");
  const [editando, setEditando] = useState<Lancamento | null>(null);

  const { data: lancamentos, isLoading } = useLancamentos({
    usuarioId: usuarioId || undefined,
    projetoId: projetoId || undefined,
    tipoTrabalhoId: tipoTrabalhoId || undefined,
    status: status || undefined,
  });

  async function handleDelete(lancamento: Lancamento) {
    if (!window.confirm(`Excluir o lançamento de ${lancamento.usuario.nome}?`)) return;
    try {
      await deleteLancamento.mutateAsync(lancamento.id);
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  }

  const totalGeral = lancamentos?.reduce((acc, l) => acc + Number(l.valorTotal), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lançamentos (todos)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualize e edite os lançamentos de qualquer colaborador, inclusive em períodos já fechados.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="w-44">
            <option value="">Todos os colaboradores</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </Select>
          <Select value={projetoId} onChange={(e) => setProjetoId(e.target.value)} className="w-44">
            <option value="">Todos os projetos</option>
            {projetos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
          <Select value={tipoTrabalhoId} onChange={(e) => setTipoTrabalhoId(e.target.value)} className="w-44">
            <option value="">Todos os tipos</option>
            {tipos?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as LancamentoStatus | "")} className="w-40">
            <option value="">Todos os status</option>
            {Object.entries(LANCAMENTO_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-5">
        {isLoading || !lancamentos ? (
          <FullPageSpinner />
        ) : lancamentos.length === 0 ? (
          <EmptyState title="Nenhum lançamento encontrado" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-3">Entrega</th>
                    <th className="py-2 pr-3">Colaborador</th>
                    <th className="py-2 pr-3">Projeto</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Qtd.</th>
                    <th className="py-2 pr-3">Valor total</th>
                    <th className="py-2 pr-3">Competência</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((lancamento) => (
                    <tr key={lancamento.id} className="border-b border-slate-100 dark:border-slate-900">
                      <td className="py-2 pr-3 whitespace-nowrap">{formatData(lancamento.dataEntrega)}</td>
                      <td className="py-2 pr-3">{lancamento.usuario.nome}</td>
                      <td className="py-2 pr-3">{lancamento.projeto.nome}</td>
                      <td className="py-2 pr-3">{lancamento.tipoTrabalho.nome}</td>
                      <td className="py-2 pr-3">{Number(lancamento.quantidade)}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{formatMoeda(lancamento.valorTotal)}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{lancamento.competencia}</td>
                      <td className="py-2 pr-3">
                        <Badge tone={lancamento.status === "ABERTO" ? "green" : "slate"}>
                          {LANCAMENTO_STATUS_LABELS[lancamento.status]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditando(lancamento)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(lancamento)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end text-sm font-semibold text-slate-900 dark:text-slate-100">
              Total: {formatMoeda(totalGeral)}
            </div>
          </>
        )}
      </Card>

      <AdminLancamentoEditModal lancamento={editando} onClose={() => setEditando(null)} />
    </div>
  );
}
