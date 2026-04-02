import axios from "axios";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { AxiosInstance } from "axios";
import type { AuthData } from "../types";
import {
  getStoredAuth,
  setStoredAuth,
  removeStoredAuth,
} from "../utils/storage";

const AxiosContext = createContext<AxiosInstance | null>(null);

let refreshPromise: Promise<AuthData> | null = null;

const refreshSession = async (
  baseURL: string,
  refreshToken: string,
): Promise<AuthData> => {
  const { data } = await axios.post<AuthData>(`${baseURL}/api/auth/refresh`, {
    refreshToken,
  });
  setStoredAuth(data);
  return data;
};

const isTokenExpired = (expiresAt: number): boolean => {
  return Date.now() >= (expiresAt - 30) * 1000;
};

export function AxiosProvider({ children }: { children: ComponentChildren }) {
  const instance = useMemo(() => {
    const baseURL = import.meta.env.VITE_API_URL || "";
    const inst = axios.create({ baseURL });

    inst.interceptors.request.use(async (config) => {
      const auth = getStoredAuth();
      if (!auth) return config;

      if (auth.session.expires_at && isTokenExpired(auth.session.expires_at)) {
        if (!refreshPromise) {
          refreshPromise = refreshSession(baseURL, auth.session.refresh_token);
        }

        try {
          const newAuth = await refreshPromise;
          config.headers.Authorization = `Bearer ${newAuth.session.access_token}`;
        } catch {
          removeStoredAuth();
          globalThis.location.href = "/login";
          throw new Error("Session expired");
        }
      } else {
        config.headers.Authorization = `Bearer ${auth.session.access_token}`;
      }

      return config;
    });

    inst.interceptors.response.use(
      (response) => response,
      (error) => {
        const message: string =
          error.response?.data?.message ?? "Ocurrió un error inesperado";
        return Promise.reject(new Error(message));
      },
    );

    return inst;
  }, []);

  return (
    <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>
  );
}

export function useAxios() {
  const ctx = useContext(AxiosContext);
  if (!ctx) throw new Error("useAxios must be used within AxiosProvider");
  return ctx;
}
