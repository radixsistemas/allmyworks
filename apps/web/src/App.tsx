import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute, ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { ChangePasswordPage } from "./features/auth/ChangePasswordPage";
import { LancamentosPage } from "./features/lancamentos/LancamentosPage";
import { UsersPage } from "./features/admin/UsersPage";
import { ProjetosPage } from "./features/admin/ProjetosPage";
import { TiposTrabalhoPage } from "./features/admin/TiposTrabalhoPage";
import { RegrasRemuneracaoPage } from "./features/admin/RegrasRemuneracaoPage";
import { LancamentosAdminPage } from "./features/admin/LancamentosAdminPage";
import { FechamentoPage } from "./features/admin/FechamentoPage";
import { RelatorioPage } from "./features/admin/RelatorioPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/trocar-senha" element={<ChangePasswordPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<LancamentosPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/lancamentos" element={<LancamentosAdminPage />} />
            <Route path="/admin/fechamento" element={<FechamentoPage />} />
            <Route path="/admin/relatorio" element={<RelatorioPage />} />
            <Route path="/admin/usuarios" element={<UsersPage />} />
            <Route path="/admin/projetos" element={<ProjetosPage />} />
            <Route path="/admin/tipos-trabalho" element={<TiposTrabalhoPage />} />
            <Route path="/admin/regras-remuneracao" element={<RegrasRemuneracaoPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
