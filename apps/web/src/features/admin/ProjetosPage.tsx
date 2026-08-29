import { useState, type FormEvent } from "react";
import { PROJETO_STATUS_LABELS } from "@allmyworks/shared";
import type { ProjetoStatus } from "@allmyworks/shared";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useCreateProjeto, useProjetos, useUpdateProjeto } from "../../hooks/useProjetos";
import { getApiErrorMessage } from "../../lib/api";
import type { Projeto } from "../../types/api";

export function ProjetosPage() {
  const { data: projetos, isLoading } = useProjetos();
  const createProjeto = useCreateProjeto();
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createProjeto.mutateAsync({ nome });
      setNome("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Projetos</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Livros e projetos disponíveis para lançamento</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Field label="Novo projeto" required>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Coleção Raízes — Vol. 2" />
            </Field>
          </div>
          <Button type="submit" disabled={createProjeto.isPending}>
            {createProjeto.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      <Card className="p-5">
        {isLoading || !projetos ? (
          <FullPageSpinner />
        ) : projetos.length === 0 ? (
          <EmptyState title="Nenhum projeto cadastrado" description="Adicione o primeiro projeto acima." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3" />
                </tr>
              </thead>
              <tbody>
                {projetos.map((p) => (
                  <ProjetoRow key={p.id} projeto={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProjetoRow({ projeto }: { projeto: Projeto }) {
  const updateProjeto = useUpdateProjeto(projeto.id);

  async function toggleStatus() {
    const novoStatus: ProjetoStatus = projeto.status === "ATIVO" ? "INATIVO" : "ATIVO";
    try {
      await updateProjeto.mutateAsync({ status: novoStatus });
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-900">
      <td className="py-2 pr-3">{projeto.nome}</td>
      <td className="py-2 pr-3">
        <Badge tone={projeto.status === "ATIVO" ? "green" : "slate"}>{PROJETO_STATUS_LABELS[projeto.status]}</Badge>
      </td>
      <td className="py-2 pr-3">
        <Button size="sm" variant="ghost" onClick={toggleStatus} disabled={updateProjeto.isPending}>
          {projeto.status === "ATIVO" ? "Inativar" : "Reativar"}
        </Button>
      </td>
    </tr>
  );
}
