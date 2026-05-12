const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStoredToken = () => localStorage.getItem('zovex-token');

export const setStoredToken = (token: string) => {
  if (token) localStorage.setItem('zovex-token', token);
};

export const clearStoredToken = () => {
  localStorage.removeItem('zovex-token');
};

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data as T;
};

export { API_URL };
