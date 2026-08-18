import { useMemo, useState, type FormEvent } from "react";
import { LANCAMENTO_STATUS_LABELS } from "@allmyworks/shared";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useProjetos } from "../../hooks/useProjetos";
import { useMinhasRegras } from "../../hooks/useRegrasRemuneracao";
import { useCreateLancamento, useDeleteLancamento, useLancamentos } from "../../hooks/useLancamentos";
import { getApiErrorMessage } from "../../lib/api";
import { formatData, formatMoeda } from "../../lib/format";
import { LancamentoEditModal } from "./LancamentoEditModal";
import type { Lancamento } from "../../types/api";

export function LancamentosPage() {
  const { data: projetos } = useProjetos({ status: "ATIVO" });
  const { data: minhasRegras } = useMinhasRegras();
  const createLancamento = useCreateLancamento();
  const deleteLancamento = useDeleteLancamento();

  const [projetoId, setProjetoId] = useState("");
  const [tipoTrabalhoId, setTipoTrabalhoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [dataEntrega, setDataEntrega] = useState(() => new Date().toISOString().slice(0, 10));
  const [valorUnitarioLivre, setValorUnitarioLivre] = useState("");
  const [linkEntrega, setLinkEntrega] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [filtroProjeto, setFiltroProjeto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [editando, setEditando] = useState<Lancamento | null>(null);

  const { data: lancamentos, isLoading } = useLancamentos({
    projetoId: filtroProjeto || undefined,
    tipoTrabalhoId: filtroTipo || undefined,
  });

  const regraSelecionada = useMemo(
    () => minhasRegras?.find((r) => r.tipoTrabalhoId === tipoTrabalhoId),
    [minhasRegras, tipoTrabalhoId],
  );
  const valorTravado = regraSelecionada && regraSelecionada.modalidade !== "LIVRE";
  const valorUnitario = valorTravado ? Number(regraSelecionada!.valorUnitario) : Number(valorUnitarioLivre || 0);
  const valorTotal = Number(quantidade || 0) * valorUnitario;

  function limparFormulario() {
    setProjetoId("");
    setTipoTrabalhoId("");
    setDescricao("");
    setQuantidade("1");
    setDataEntrega(new Date().toISOString().slice(0, 10));
    setValorUnitarioLivre("");
    setLinkEntrega("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createLancamento.mutateAsync({
        projetoId,
        tipoTrabalhoId,
        descricao: descricao || undefined,
        quantidade: Number(quantidade),
        dataEntrega,
        valorUnitario: valorTravado ? undefined : Number(valorUnitarioLivre),
        linkEntrega: linkEntrega || undefined,
      });
      limparFormulario();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este lançamento?")) return;
    try {
      await deleteLancamento.mutateAsync(id);
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  }

  const semRegrasConfiguradas = minhasRegras && minhasRegras.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Meus lançamentos</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registre os trabalhos entregues para fechamento financeiro.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Novo lançamento</h2>

        {semRegrasConfiguradas ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Você ainda não tem tipos de trabalho habilitados no seu perfil de remuneração. Contate o administrador.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Projeto" required>
                <Select required value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {projetos?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo de trabalho" required>
                <Select required value={tipoTrabalhoId} onChange={(e) => setTipoTrabalhoId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {minhasRegras?.map((r) => (
                    <option key={r.tipoTrabalhoId} value={r.tipoTrabalhoId}>
                      {r.tipoTrabalho.nome}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Descrição">
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Opcional" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Quantidade${regraSelecionada ? ` (${regraSelecionada.tipoTrabalho.unidadePadrao ?? "un."})` : ""}`} required>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </Field>
              <Field label="Data de entrega" required>
                <Input type="date" required value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Valor unitário"
                required
                hint={
                  regraSelecionada
                    ? valorTravado
                      ? "Definido pelo perfil de remuneração"
                      : "Informe o valor combinado para este trabalho"
                    : "Selecione um tipo de trabalho"
                }
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={!!valorTravado}
                  value={valorTravado ? Number(regraSelecionada!.valorUnitario) : valorUnitarioLivre}
                  onChange={(e) => setValorUnitarioLivre(e.target.value)}
                />
              </Field>
              <Field label="Valor total">
                <Input disabled value={formatMoeda(valorTotal || 0)} />
              </Field>
            </div>

            <Field label="Link da entrega">
              <Input
                type="url"
                value={linkEntrega}
                onChange={(e) => setLinkEntrega(e.target.value)}
                placeholder="https://"
              />
            </Field>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={createLancamento.isPending}>
                {createLancamento.isPending ? "Lançando..." : "Lançar trabalho"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lançamentos</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)} className="w-40">
              <option value="">Todos os projetos</option>
              {projetos?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
            <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-44">
              <option value="">Todos os tipos</option>
              {minhasRegras?.map((r) => (
                <option key={r.tipoTrabalhoId} value={r.tipoTrabalhoId}>
                  {r.tipoTrabalho.nome}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {isLoading || !lancamentos ? (
          <FullPageSpinner />
        ) : lancamentos.length === 0 ? (
          <EmptyState title="Nenhum lançamento" description="Seus lançamentos aparecerão aqui." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Entrega</th>
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
                      {lancamento.status === "ABERTO" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditando(lancamento)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(lancamento.id)}>
                            Excluir
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LancamentoEditModal lancamento={editando} onClose={() => setEditando(null)} />
    </div>
  );
}
