import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { forgotPassword, resetPassword } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [form, setForm] = useState({ otp: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      setStep('reset');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send OTP.');
    }
  };

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await resetPassword({ email, otp: form.otp, password: form.password });
      navigate('/login');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Password reset failed.');
    }
  };

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={step === 'email' ? handleSendOtp : handleReset}>
        <p className="eyebrow">Password help</p>
        <h1>{step === 'email' ? 'Send reset OTP' : 'Create new password'}</h1>
        {message && <div className="success">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <Input id="email" name="email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={step === 'reset'} required />
        {step === 'reset' && (
          <>
            <Input id="otp" name="otp" label="OTP code" inputMode="numeric" minLength={6} maxLength={6} value={form.otp} onChange={updateField} required />
            <Input id="password" name="password" label="New password" type="password" minLength={6} value={form.password} onChange={updateField} required />
          </>
        )}
        <Button fullWidth>{step === 'email' ? 'Send OTP' : 'Reset password'}</Button>
      </form>
    </section>
  );
}
