import { useState, type FormEvent } from "react";
import { GLOBAL_ROLE_LABELS, USER_STATUS_LABELS } from "@allmyworks/shared";
import type { GlobalRole, UserStatus } from "@allmyworks/shared";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useCreateUser, useResetPassword, useUpdateUserStatus, useUsers } from "../../hooks/useUsers";
import { getApiErrorMessage } from "../../lib/api";

const statusTone: Record<UserStatus, "green" | "amber" | "slate"> = {
  ATIVO: "green",
  BLOQUEADO: "amber",
  ARQUIVADO: "slate",
};

export function UsersPage() {
  const [filtroStatus, setFiltroStatus] = useState<UserStatus | "">("");
  const { data: users, isLoading } = useUsers({ status: filtroStatus || undefined });
  const updateStatus = useUpdateUserStatus();
  const resetPassword = useResetPassword();
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: UserStatus) {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleResetPassword(id: string, nome: string) {
    if (!window.confirm(`Gerar uma nova senha temporária para ${nome}?`)) return;
    setActionError(null);
    try {
      await resetPassword.mutateAsync(id);
      window.alert("Senha redefinida. Um e-mail foi enviado (ou registrado no console, se SMTP não estiver configurado).");
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Usuários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Colaboradores e administradores do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as UserStatus | "")} className="w-40">
            <option value="">Ativos e bloqueados</option>
            {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button onClick={() => setModalOpen(true)}>+ Novo usuário</Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}

      <Card className="p-5">
        {isLoading || !users ? (
          <FullPageSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">E-mail</th>
                  <th className="py-2 pr-3">Papel</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-900">
                    <td className="py-2 pr-3">{u.nome}</td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{GLOBAL_ROLE_LABELS[u.papel]}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={statusTone[u.status]}>{USER_STATUS_LABELS[u.status]}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        {u.status !== "ATIVO" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(u.id, "ATIVO")}>
                            Ativar
                          </Button>
                        )}
                        {u.status !== "BLOQUEADO" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(u.id, "BLOQUEADO")}>
                            Bloquear
                          </Button>
                        )}
                        {u.status !== "ARQUIVADO" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(u.id, "ARQUIVADO")}>
                            Arquivar
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleResetPassword(u.id, u.nome)}>
                          Resetar senha
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NovoUsuarioModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function NovoUsuarioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createUser = useCreateUser();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<GlobalRole>("COLABORADOR");
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setNome("");
    setEmail("");
    setPapel("COLABORADOR");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createUser.mutateAsync({ nome, email, papel });
      handleClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo usuário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required>
          <Input required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="E-mail" required>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Papel" required>
          <Select value={papel} onChange={(e) => setPapel(e.target.value as GlobalRole)}>
            {Object.entries(GLOBAL_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Uma senha temporária será gerada e enviada por e-mail. O usuário será obrigado a trocá-la no primeiro acesso.
        </p>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
