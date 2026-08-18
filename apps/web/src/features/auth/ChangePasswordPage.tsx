import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../../lib/api";
import { useAuth } from "../../stores/auth-store";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function ChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (sucesso && !user?.senhaTemporaria) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (novaSenha !== confirmacao) {
      setError("A confirmação não confere com a nova senha");
      return;
    }

    setSubmitting(true);
    try {
      await api.patch("/auth/password", { senhaAtual, novaSenha });
      await refreshUser();
      setSucesso(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Trocar senha</h1>
          {user?.senhaTemporaria ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Este é seu primeiro acesso. Defina uma nova senha para continuar.
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Altere sua senha de acesso.</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Senha atual" required>
            <Input
              type="password"
              required
              autoFocus
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </Field>
          <Field label="Nova senha" required hint="Pelo menos 8 caracteres">
            <Input type="password" required minLength={8} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
          </Field>
          <Field label="Confirme a nova senha" required>
            <Input
              type="password"
              required
              minLength={8}
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {sucesso && !error && <p className="text-sm text-green-600 dark:text-green-400">Senha alterada com sucesso.</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
