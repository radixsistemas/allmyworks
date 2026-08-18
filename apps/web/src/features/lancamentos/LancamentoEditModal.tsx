import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field } from "../../components/ui/Field";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useProjetos } from "../../hooks/useProjetos";
import { useMinhasRegras } from "../../hooks/useRegrasRemuneracao";
import { useUpdateLancamento } from "../../hooks/useLancamentos";
import { getApiErrorMessage } from "../../lib/api";
import { formatMoeda } from "../../lib/format";
import { toDateInputValue } from "../../lib/format";
import type { Lancamento } from "../../types/api";

interface LancamentoEditModalProps {
  lancamento: Lancamento | null;
  onClose: () => void;
}

export function LancamentoEditModal({ lancamento, onClose }: LancamentoEditModalProps) {
  const { data: projetos } = useProjetos({ status: "ATIVO" });
  const { data: minhasRegras } = useMinhasRegras();
  const updateLancamento = useUpdateLancamento(lancamento?.id ?? "");

  const [projetoId, setProjetoId] = useState("");
  const [tipoTrabalhoId, setTipoTrabalhoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [dataEntrega, setDataEntrega] = useState("");
  const [valorUnitarioLivre, setValorUnitarioLivre] = useState("");
  const [linkEntrega, setLinkEntrega] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lancamento) return;
    setProjetoId(lancamento.projetoId);
    setTipoTrabalhoId(lancamento.tipoTrabalhoId);
    setDescricao(lancamento.descricao ?? "");
    setQuantidade(lancamento.quantidade);
    setDataEntrega(toDateInputValue(lancamento.dataEntrega));
    setValorUnitarioLivre(lancamento.valorUnitario);
    setLinkEntrega(lancamento.linkEntrega ?? "");
    setError(null);
  }, [lancamento]);

  const regraSelecionada = useMemo(
    () => minhasRegras?.find((r) => r.tipoTrabalhoId === tipoTrabalhoId),
    [minhasRegras, tipoTrabalhoId],
  );
  const valorTravado = regraSelecionada && regraSelecionada.modalidade !== "LIVRE";
  const valorUnitario = valorTravado ? Number(regraSelecionada!.valorUnitario) : Number(valorUnitarioLivre || 0);
  const valorTotal = Number(quantidade || 0) * valorUnitario;

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
        valorUnitario: valorTravado ? undefined : Number(valorUnitarioLivre),
        linkEntrega: linkEntrega || "",
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={!!lancamento} onClose={onClose} title="Editar lançamento">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {minhasRegras?.map((r) => (
              <option key={r.tipoTrabalhoId} value={r.tipoTrabalhoId}>
                {r.tipoTrabalho.nome}
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
          <Field label="Valor unitário" required hint={valorTravado ? "Definido pelo perfil de remuneração" : undefined}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              disabled={valorTravado}
              value={valorTravado ? Number(regraSelecionada!.valorUnitario) : valorUnitarioLivre}
              onChange={(e) => setValorUnitarioLivre(e.target.value)}
            />
          </Field>
          <Field label="Valor total">
            <Input disabled value={formatMoeda(valorTotal)} />
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
