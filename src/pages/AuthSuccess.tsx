import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setStoredToken } from '../services/apiClient';
import { fetchMe } from '../services/authService';

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setStoredToken(token);
    fetchMe()
      .then(setUser)
      .finally(() => navigate('/', { replace: true }));
  }, [navigate, params, setUser]);

  return <div className="status-line page-offset">Finishing Google sign in...</div>;
}
