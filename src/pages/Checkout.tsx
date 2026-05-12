import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createCheckoutSession, createOrder } from '../services/orderService';

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', line1: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      phone: user.phone || '',
      line1: user.address?.line1 || '',
      city: user.address?.city || '',
      postalCode: user.address?.postalCode || '',
      country: user.address?.country || ''
    });
  }, [user]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const order = await createOrder({
        shippingAddress: form,
        items: items.map((item) => ({ product: item.product._id, quantity: item.quantity }))
      });
      const session = await createCheckoutSession(order._id);
      window.location.href = session.url;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="empty-state">
        <h1>Sign in to checkout</h1>
        <p>Your cart is ready. Sign in so the order can be connected to your account.</p>
        <Button as={Link} to="/login">
          Sign in
        </Button>
      </section>
    );
  }

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  return (
    <section className="auth-shell checkout-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Checkout</p>
        <h1>Shipping details</h1>
        {error && <div className="alert">{error}</div>}
        <Input id="phone" name="phone" label="Phone number" type="tel" value={form.phone} onChange={updateField} required />
        <Input id="line1" name="line1" label="Address line" value={form.line1} onChange={updateField} required />
        <Input id="city" name="city" label="City" value={form.city} onChange={updateField} required />
        <Input id="postalCode" name="postalCode" label="Postal code" value={form.postalCode} onChange={updateField} required />
        <Input id="country" name="country" label="Country" value={form.country} onChange={updateField} required />
        <Button disabled={loading} fullWidth>
          {loading ? 'Creating checkout...' : 'Pay with Stripe sandbox'}
        </Button>
      </form>
    </section>
  );
}
