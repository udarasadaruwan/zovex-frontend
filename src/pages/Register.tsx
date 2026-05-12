import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { googleLoginUrl } from '../services/authService';
import type { UserRole } from '../types';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'user' | 'seller'>;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed.');
    }
  };

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Start shopping</p>
        <h1>Create account</h1>
        {error && <div className="alert">{error}</div>}
        <Input id="name" name="name" label="Full name" value={form.name} onChange={updateField} required />
        <Input id="email" name="email" label="Email" type="email" value={form.email} onChange={updateField} required />
        <label className="field" htmlFor="role">
          <span>Account type</span>
          <select id="role" name="role" value={form.role} onChange={updateField}>
            <option value="user">User</option>
            <option value="seller">Seller</option>
          </select>
        </label>
        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          minLength={6}
          value={form.password}
          onChange={updateField}
          required
        />
        <Button fullWidth>Create account</Button>
        <Button as="a" href={googleLoginUrl} variant="ghost" fullWidth className="google-btn">
          <span className="google-mark">
            <GoogleIcon />
          </span>
          Continue with Google
        </Button>
        <p className="form-note">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </section>
  );
}
