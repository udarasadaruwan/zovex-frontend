import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { confirmCheckoutSession } from '../services/orderService';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = React.useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('Checkout session was not found.');
      return;
    }

    confirmCheckoutSession(sessionId)
      .then(() => {
        clearCart();
        setStatus('success');
      })
      .catch((requestError) => {
        setStatus('error');
        setError(requestError instanceof Error ? requestError.message : 'Unable to confirm payment.');
      });
  }, [clearCart, searchParams]);

  if (status === 'loading') {
    return <div className="status-line page-offset">Confirming payment...</div>;
  }

  if (status === 'error') {
    return (
      <section className="empty-state">
        <h1>Payment not confirmed</h1>
        <p>{error}</p>
        <Button as={Link} to="/cart">
          Back to cart
        </Button>
      </section>
    );
  }

  return (
    <section className="order-success-page">
      <div className="order-success-popup" role="status" aria-live="polite">
        <span className="order-success-icon">
          <CheckCircle2 size={42} />
        </span>
        <p className="eyebrow">Payment successful</p>
        <h1>Order placed successfully</h1>
        <p>Your payment was completed and your cart has been cleared.</p>
        <div className="order-success-actions">
          <Button as={Link} to="/dashboard/user">
            View dashboard
          </Button>
          <Button as={Link} to="/products" variant="ghost">
            Continue shopping
          </Button>
        </div>
      </div>
    </section>
  );
}
