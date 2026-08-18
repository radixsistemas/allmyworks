import { useEffect, useState } from "react";
import { MODALIDADE_REMUNERACAO_LABELS, MODALIDADES_REMUNERACAO } from "@allmyworks/shared";
import type { ModalidadeRemuneracao } from "@allmyworks/shared";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useUsers } from "../../hooks/useUsers";
import { useRegrasPorUsuario, useSetRegrasUsuario, type RegraItemInput } from "../../hooks/useRegrasRemuneracao";
import { getApiErrorMessage } from "../../lib/api";

interface LinhaRegra {
  tipoTrabalhoId: string;
  nome: string;
  unidadePadrao: string | null;
  habilitado: boolean;
  modalidade: ModalidadeRemuneracao;
  valorUnitario: string;
}

export function RegrasRemuneracaoPage() {
  const { data: users } = useUsers();
  const [usuarioId, setUsuarioId] = useState("");
  const { data: regras, isLoading } = useRegrasPorUsuario(usuarioId || undefined);
  const setRegras = useSetRegrasUsuario(usuarioId);

  const [linhas, setLinhas] = useState<LinhaRegra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!regras) {
      setLinhas([]);
      return;
    }
    setLinhas(
      regras.map(({ tipoTrabalho, regra }) => ({
        tipoTrabalhoId: tipoTrabalho.id,
        nome: tipoTrabalho.nome,
        unidadePadrao: tipoTrabalho.unidadePadrao,
        habilitado: !!regra,
        modalidade: regra?.modalidade ?? "FIXO_POR_TRABALHO",
        valorUnitario: regra?.valorUnitario ?? "",
      })),
    );
    setSucesso(false);
    setError(null);
  }, [regras]);

  function atualizarLinha(tipoTrabalhoId: string, patch: Partial<LinhaRegra>) {
    setLinhas((prev) => prev.map((l) => (l.tipoTrabalhoId === tipoTrabalhoId ? { ...l, ...patch } : l)));
  }

  async function handleSalvar() {
    setError(null);
    setSucesso(false);

    const habilitadas = linhas.filter((l) => l.habilitado);
    for (const linha of habilitadas) {
      if (linha.modalidade !== "LIVRE" && !linha.valorUnitario) {
        setError(`Informe o valor unitário para "${linha.nome}"`);
        return;
      }
    }

    const payload: RegraItemInput[] = habilitadas.map((l) => ({
      tipoTrabalhoId: l.tipoTrabalhoId,
      modalidade: l.modalidade,
      valorUnitario: l.modalidade === "LIVRE" ? undefined : Number(l.valorUnitario),
    }));

    try {
      await setRegras.mutateAsync(payload);
      setSucesso(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const colaboradores = users?.filter((u) => u.status !== "ARQUIVADO") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Regras de remuneração</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Defina, por colaborador, quais tipos de trabalho ele pode lançar e como o valor é calculado.
        </p>
      </div>

      <Card className="p-5">
        <Field label="Colaborador">
          <Select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="max-w-sm">
            <option value="">Selecione um usuário...</option>
            {colaboradores.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {usuarioId && (
        <Card className="p-5">
          {isLoading || !regras ? (
            <FullPageSpinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-3">Habilitado</th>
                      <th className="py-2 pr-3">Tipo de trabalho</th>
                      <th className="py-2 pr-3">Modalidade</th>
                      <th className="py-2 pr-3">Valor unitário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((linha) => (
                      <tr key={linha.tipoTrabalhoId} className="border-b border-slate-100 dark:border-slate-900">
                        <td className="py-2 pr-3">
                          <input
                            type="checkbox"
                            checked={linha.habilitado}
                            onChange={(e) => atualizarLinha(linha.tipoTrabalhoId, { habilitado: e.target.checked })}
                          />
                        </td>
                        <td className="py-2 pr-3">
                          {linha.nome}
                          {linha.unidadePadrao && (
                            <span className="ml-1 text-xs text-slate-400">({linha.unidadePadrao})</span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <Select
                            disabled={!linha.habilitado}
                            value={linha.modalidade}
                            onChange={(e) =>
                              atualizarLinha(linha.tipoTrabalhoId, { modalidade: e.target.value as ModalidadeRemuneracao })
                            }
                            className="min-w-[220px]"
                          >
                            {MODALIDADES_REMUNERACAO.map((m) => (
                              <option key={m} value={m}>
                                {MODALIDADE_REMUNERACAO_LABELS[m]}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={!linha.habilitado || linha.modalidade === "LIVRE"}
                            placeholder={linha.modalidade === "LIVRE" ? "Informado no lançamento" : "0,00"}
                            value={linha.valorUnitario}
                            onChange={(e) => atualizarLinha(linha.tipoTrabalhoId, { valorUnitario: e.target.value })}
                            className="w-32"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
              {sucesso && !error && (
                <p className="mt-3 text-sm text-green-600 dark:text-green-400">Perfil de remuneração salvo.</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button onClick={handleSalvar} disabled={setRegras.isPending}>
                  {setRegras.isPending ? "Salvando..." : "Salvar perfil"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
