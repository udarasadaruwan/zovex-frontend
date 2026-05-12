import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return <EmptyState title="Your cart is empty" text="Add a product and it will appear here." />;
  }

  return (
    <section className="cart-layout">
      <div className="cart-items">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shopping cart</p>
            <h1>Your selected products</h1>
          </div>
        </div>
        {items.map(({ product, quantity }) => (
          <article className="cart-item" key={product._id}>
            <img src={product.images?.[0]?.url} alt={product.name} />
            <div>
              <h2>{product.name}</h2>
              <p>${product.price.toFixed(2)}</p>
            </div>
            <div className="stepper">
              <button aria-label="Decrease quantity" onClick={() => updateQuantity(product._id, quantity - 1)}>
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button aria-label="Increase quantity" onClick={() => updateQuantity(product._id, quantity + 1)}>
                <Plus size={15} />
              </button>
            </div>
            <button className="icon-button" aria-label="Remove item" onClick={() => removeItem(product._id)}>
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
      <aside className="summary-box">
        <h2>Order summary</h2>
        <div>
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <strong>{subtotal > 100 ? 'Free' : '$8.00'}</strong>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>${(subtotal + (subtotal > 100 ? 0 : 8)).toFixed(2)}</strong>
        </div>
        <Button as={Link} to="/checkout" fullWidth>
          Checkout
        </Button>
      </aside>
    </section>
  );
}
