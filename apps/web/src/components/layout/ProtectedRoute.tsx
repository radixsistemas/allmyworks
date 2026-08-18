import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../stores/auth-store";
import { FullPageSpinner } from "../ui/Spinner";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.senhaTemporaria && location.pathname !== "/trocar-senha") {
    return <Navigate to="/trocar-senha" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuth();
  if (user?.papel !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
}
