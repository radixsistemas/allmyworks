import { useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useCreateTipoTrabalho, useTiposTrabalho, useUpdateTipoTrabalho } from "../../hooks/useTiposTrabalho";
import { getApiErrorMessage } from "../../lib/api";
import type { TipoTrabalho } from "../../types/api";

export function TiposTrabalhoPage() {
  const { data: tipos, isLoading } = useTiposTrabalho();
  const createTipo = useCreateTipoTrabalho();
  const [nome, setNome] = useState("");
  const [unidadePadrao, setUnidadePadrao] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createTipo.mutateAsync({ nome, unidadePadrao: unidadePadrao || undefined });
      setNome("");
      setUnidadePadrao("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tipos de trabalho</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ex.: Capa, Diagramação, Revisão, Preparação de texto — configuráveis livremente
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Field label="Nome" required>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Diagramação" />
            </Field>
          </div>
          <div className="min-w-[200px] flex-1">
            <Field label="Unidade padrão">
              <Input value={unidadePadrao} onChange={(e) => setUnidadePadrao(e.target.value)} placeholder="Ex: página" />
            </Field>
          </div>
          <Button type="submit" disabled={createTipo.isPending}>
            {createTipo.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          "Unidade padrão" é apenas um rótulo de referência, ex: página, lauda, trabalho.
        </p>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      <Card className="p-5">
        {isLoading || !tipos ? (
          <FullPageSpinner />
        ) : tipos.length === 0 ? (
          <EmptyState title="Nenhum tipo de trabalho cadastrado" description="Adicione o primeiro tipo de trabalho acima." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">Unidade padrão</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3" />
                </tr>
              </thead>
              <tbody>
                {tipos.map((t) => (
                  <TipoTrabalhoRow key={t.id} tipo={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function TipoTrabalhoRow({ tipo }: { tipo: TipoTrabalho }) {
  const updateTipo = useUpdateTipoTrabalho(tipo.id);

  async function toggleAtivo() {
    try {
      await updateTipo.mutateAsync({ ativo: !tipo.ativo });
    } catch (err) {
      window.alert(getApiErrorMessage(err));
    }
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-900">
      <td className="py-2 pr-3">{tipo.nome}</td>
      <td className="py-2 pr-3">{tipo.unidadePadrao ?? "—"}</td>
      <td className="py-2 pr-3">
        <Badge tone={tipo.ativo ? "green" : "slate"}>{tipo.ativo ? "Ativo" : "Inativo"}</Badge>
      </td>
      <td className="py-2 pr-3">
        <Button size="sm" variant="ghost" onClick={toggleAtivo} disabled={updateTipo.isPending}>
          {tipo.ativo ? "Inativar" : "Reativar"}
        </Button>
      </td>
    </tr>
  );
}
