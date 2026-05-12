import { apiRequest, API_URL, clearStoredToken, setStoredToken } from './apiClient';
import type { User, UserRole } from '../types';

interface AuthPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthPayload {
  name: string;
  role: Extract<UserRole, 'user' | 'seller'>;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface MeResponse {
  user: User;
}

export const login = async (payload: AuthPayload) => {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setStoredToken(data.token);
  return data.user;
};

export const register = async (payload: RegisterPayload) => {
  const data = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setStoredToken(data.token);
  return data.user;
};

export const fetchMe = async () => {
  const data = await apiRequest<MeResponse>('/auth/me');
  return data.user;
};

export const logout = async () => {
  try {
    await apiRequest<{ message: string }>('/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
};

export const forgotPassword = async (email: string) => {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPassword = async (payload: { email: string; otp: string; password: string }) => {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const googleLoginUrl = `${API_URL}/auth/google`;
