import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../stores/auth-store";

const navItemsColaborador = [{ to: "/", label: "Meus lançamentos", end: true }];

const navItemsAdmin = [
  { to: "/", label: "Meus lançamentos", end: true },
  { to: "/admin/lancamentos", label: "Lançamentos (todos)", end: false },
  { to: "/admin/fechamento", label: "Fechamento", end: false },
  { to: "/admin/relatorio", label: "Relatório de pagamentos", end: false },
  { to: "/admin/usuarios", label: "Usuários", end: false },
  { to: "/admin/projetos", label: "Projetos", end: false },
  { to: "/admin/tipos-trabalho", label: "Tipos de trabalho", end: false },
  { to: "/admin/regras-remuneracao", label: "Regras de remuneração", end: false },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navItems = user?.papel === "ADMIN" ? navItemsAdmin : navItemsColaborador;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Editora</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Lançamento de Trabalhos</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-14 md:pb-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 md:hidden">Editora</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium text-slate-800 dark:text-slate-100">{user?.nome}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.papel === "ADMIN" ? "Administrador" : "Colaborador"}
              </p>
            </div>
            <NavLink
              to="/trocar-senha"
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Trocar senha
            </NavLink>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                "flex-1 px-3 py-3 text-center text-xs font-medium whitespace-nowrap",
                isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
