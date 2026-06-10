import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';
import { clearStoredToken, getStoredToken } from '../services/apiClient';
import type { User, UserRole } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
  role: Extract<UserRole, 'user' | 'seller'>;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    if (!getStoredToken()) return;

    fetchMe()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (payload) => {
        const nextUser = await loginRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      register: async (payload) => {
        const nextUser = await registerRequest(payload);
        setUser(nextUser);
        return nextUser;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
      },
      setUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};
