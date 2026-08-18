import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { authStorage } from "../lib/auth-storage";
import type { User } from "../types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    if (!authStorage.getAccessToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>("/users/me");
      setUser(data);
    } catch {
      authStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    authStorage.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user as User;
  }

  async function logout() {
    const refreshToken = authStorage.getRefreshToken();
    authStorage.clear();
    setUser(null);
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // já limpamos localmente; falha no logout remoto não é crítica
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
