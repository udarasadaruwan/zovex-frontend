import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { googleLoginUrl } from '../services/authService';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isBusy = isSubmitting || isGoogleLoading;

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;

    setError('');
    setIsSubmitting(true);
    try {
      await login(form);
      navigate('/');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sign in failed.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setError('');
    setIsGoogleLoading(true);
    window.setTimeout(() => {
      window.location.assign(googleLoginUrl);
    }, 520);
  };

  return (
    <section className="auth-shell">
      {isBusy && <AuthLoadingOverlay message={isGoogleLoading ? 'Opening Google sign in' : 'Signing you in'} />}
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        {error && <div className="alert">{error}</div>}
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField}
          disabled={isBusy}
          required
        />
        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={updateField}
          disabled={isBusy}
          required
        />
        <Button fullWidth loading={isSubmitting} loadingText="Signing in..." disabled={isBusy}>
          Sign in
        </Button>
        <Button
          as="a"
          href={googleLoginUrl}
          variant="ghost"
          fullWidth
          className="google-btn"
          loading={isGoogleLoading}
          loadingText="Opening Google..."
          onClick={handleGoogleClick}
        >
          <span className="google-mark">
            <GoogleIcon />
          </span>
          Continue with Google
        </Button>
        <p className="form-note">
          Forgot password? <Link to="/forgot-password">Send reset OTP</Link>
        </p>
        <p className="form-note">
          New customer? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
