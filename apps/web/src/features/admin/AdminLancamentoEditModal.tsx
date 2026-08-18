import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field } from "../../components/ui/Field";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useProjetos } from "../../hooks/useProjetos";
import { useTiposTrabalho } from "../../hooks/useTiposTrabalho";
import { useUpdateLancamento } from "../../hooks/useLancamentos";
import { getApiErrorMessage } from "../../lib/api";
import { formatMoeda, toDateInputValue } from "../../lib/format";
import type { Lancamento } from "../../types/api";

interface AdminLancamentoEditModalProps {
  lancamento: Lancamento | null;
  onClose: () => void;
}

export function AdminLancamentoEditModal({ lancamento, onClose }: AdminLancamentoEditModalProps) {
  const { data: projetos } = useProjetos();
  const { data: tipos } = useTiposTrabalho();
  const updateLancamento = useUpdateLancamento(lancamento?.id ?? "");

  const [projetoId, setProjetoId] = useState("");
  const [tipoTrabalhoId, setTipoTrabalhoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [dataEntrega, setDataEntrega] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [linkEntrega, setLinkEntrega] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lancamento) return;
    setProjetoId(lancamento.projetoId);
    setTipoTrabalhoId(lancamento.tipoTrabalhoId);
    setDescricao(lancamento.descricao ?? "");
    setQuantidade(lancamento.quantidade);
    setDataEntrega(toDateInputValue(lancamento.dataEntrega));
    setValorUnitario(lancamento.valorUnitario);
    setLinkEntrega(lancamento.linkEntrega ?? "");
    setError(null);
  }, [lancamento]);

  const valorTotal = Number(quantidade || 0) * Number(valorUnitario || 0);

  if (!lancamento) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await updateLancamento.mutateAsync({
        projetoId,
        tipoTrabalhoId,
        descricao: descricao || undefined,
        quantidade: Number(quantidade),
        dataEntrega,
        valorUnitario: Number(valorUnitario),
        linkEntrega: linkEntrega || "",
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={!!lancamento} onClose={onClose} title={`Editar lançamento — ${lancamento.usuario.nome}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {lancamento.status === "FECHADO" && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Este lançamento está em um período fechado. Como administrador, você pode editá-lo — a alteração fica registrada em auditoria.
          </p>
        )}
        <Field label="Projeto" required>
          <Select required value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
            {projetos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de trabalho" required>
          <Select required value={tipoTrabalhoId} onChange={(e) => setTipoTrabalhoId(e.target.value)}>
            {tipos?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Descrição">
          <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantidade" required>
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor unitário" required hint="Como administrador, você pode sobrescrever este valor">
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
            />
          </Field>
          <Field label="Valor total">
            <Input disabled value={formatMoeda(valorTotal || 0)} />
          </Field>
        </div>
        <Field label="Link da entrega">
          <Input type="url" value={linkEntrega} onChange={(e) => setLinkEntrega(e.target.value)} placeholder="https://" />
        </Field>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateLancamento.isPending}>
            {updateLancamento.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
