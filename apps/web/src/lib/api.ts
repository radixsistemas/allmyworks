import axios, { type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./auth-storage";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("Sem refresh token disponível");

  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  authStorage.setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && authStorage.getRefreshToken()) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        authStorage.clear();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message;
  }
  return "Erro inesperado";
}
