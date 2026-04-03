import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { AuthData } from '../types';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '../utils/storage';
import { useAxios } from './AxiosProvider';
import { useToast } from './ToastProvider';
import { useNavigate } from 'react-router-dom';

interface UserContextType {
  auth: AuthData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ComponentChildren }) => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [auth, setAuthState] = useState<AuthData | null>(getStoredAuth);
  const [loading, setLoading] = useState(false);

  const setAuth = (value: AuthData | null) => {
    if (value) {
      setStoredAuth(value);
    } else {
      removeStoredAuth();
    }
    setAuthState(value);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post<AuthData>('/api/auth/login', { email, password });
      setAuth(data);
      navigate('/rooms');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al iniciar sesion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userName: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post<AuthData>('/api/auth/register', { email, password, userName });
      setAuth(data);
      navigate('/rooms');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al registrarse', 'error');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth(null);
    navigate('/login');
  };

  return (
    <UserContext.Provider value={{ auth, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
