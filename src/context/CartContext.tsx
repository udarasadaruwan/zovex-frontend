import React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import CartConfirmation from '../components/CartConfirmation';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  count: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'zovex-cart';

interface CartConfirmationState {
  id: number;
  productName: string;
  quantity: number;
}

const readStoredCart = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = useState(readStoredCart);
  const [confirmation, setConfirmation] = useState<CartConfirmationState | null>(null);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems((current) => (current.length ? [] : current));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    return {
      items,
      subtotal,
      count: items.reduce((total, item) => total + item.quantity, 0),
      addItem: (product: Product, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((item) => item.product._id === product._id);
          if (existing) {
            return current.map((item) =>
              item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
            );
          }
          return [...current, { product, quantity }];
        });
        setConfirmation({
          id: Date.now(),
          productName: product.name,
          quantity
        });
      },
      updateQuantity: (productId: string, quantity: number) => {
        setItems((current) =>
          current
            .map((item) => (item.product._id === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem: (productId: string) => {
        setItems((current) => current.filter((item) => item.product._id !== productId));
      },
      clearCart
    };
  }, [clearCart, items]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {confirmation && (
        <CartConfirmation
          key={confirmation.id}
          productName={confirmation.productName}
          quantity={confirmation.quantity}
          onClose={closeConfirmation}
        />
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
};
