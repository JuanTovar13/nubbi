import axios from "axios";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { AuthData } from "../types";
import {
  getStoredAuth,
  setStoredAuth,
  removeStoredAuth,
} from "../utils/storage";

const AxiosContext = createContext<AxiosInstance | null>(null);

let refreshPromise: Promise<AuthData> | null = null;

const isTokenExpired = (expiresAt: number): boolean =>
  Date.now() >= (expiresAt - 30) * 1000;

const getAccessToken = async (baseURL: string): Promise<string | null> => {
  const auth = getStoredAuth();
  if (!auth) return null;

  const { session } = auth;

  if (!session.expires_at || !isTokenExpired(session.expires_at)) {
    return session.access_token;
  }

  try {
    refreshPromise ??= axios
      .post<AuthData>(`${baseURL}/api/auth/refresh`, {
        refreshToken: session.refresh_token,
      })
      .then(({ data }) => {
        setStoredAuth(data);
        return data;
      });

    const newAuth = await refreshPromise;
    return newAuth.session.access_token;
  } catch {
    removeStoredAuth();
    globalThis.location.href = "/login";
    throw new Error("Session expired");
  } finally {
    refreshPromise = null;
  }
};

const attachAuth = async (
  baseURL: string,
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const token = await getAccessToken(baseURL);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const extractErrorMessage = (error: unknown): never => {
  const message: string =
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message ?? "Ocurrió un error inesperado";
  return Promise.reject(new Error(message)) as never;
};

export const AxiosProvider = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const instance = useMemo(() => {
    const baseURL = import.meta.env.VITE_API_URL || "";
    const inst = axios.create({ baseURL });

    inst.interceptors.request.use((config) => attachAuth(baseURL, config));
    inst.interceptors.response.use((response) => response, extractErrorMessage);

    return inst;
  }, []);

  return (
    <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>
  );
};

export const useAxios = () => {
  const ctx = useContext(AxiosContext);
  if (!ctx) throw new Error("useAxios must be used within AxiosProvider");
  return ctx;
};
