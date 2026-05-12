import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingCart } from 'lucide-react';

interface CartConfirmationProps {
  productName: string;
  quantity: number;
  onClose: () => void;
}

export default function CartConfirmation({ productName, quantity, onClose }: CartConfirmationProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2400);
    return () => window.clearTimeout(timer);
  }, [onClose, productName, quantity]);

  return (
    <div className="cart-confirmation" role="status" aria-live="polite">
      <span className="cart-confirmation-icon">
        <CheckCircle2 size={22} />
      </span>
      <div>
        <strong>Added to cart</strong>
        <p>
          {quantity > 1 ? `${quantity} x ` : ''}
          {productName}
        </p>
      </div>
      <ShoppingCart className="cart-confirmation-cart" size={22} aria-hidden="true" />
    </div>
  );
}
