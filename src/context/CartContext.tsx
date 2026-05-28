import React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import CartConfirmation from '../components/CartConfirmation';
import { useAuth } from './AuthContext';
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
const LEGACY_STORAGE_KEY = 'zovex-cart';
const GUEST_STORAGE_KEY = 'zovex-cart:guest';

interface CartConfirmationState {
  id: number;
  productName: string;
  quantity: number;
}

const readStoredCart = (storageKey: string): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(storageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

const mergeCartItems = (primaryItems: CartItem[], incomingItems: CartItem[]) => {
  return incomingItems.reduce<CartItem[]>((mergedItems, incomingItem) => {
    const existing = mergedItems.find((item) => item.product._id === incomingItem.product._id);

    if (existing) {
      return mergedItems.map((item) =>
        item.product._id === incomingItem.product._id
          ? { ...item, quantity: item.quantity + incomingItem.quantity }
          : item
      );
    }

    return [...mergedItems, incomingItem];
  }, primaryItems);
};

export function CartProvider({ children }: React.PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const userId = user?.id || user?._id || user?.email;
  const storageKey = userId ? `zovex-cart:user:${userId}` : GUEST_STORAGE_KEY;
  const [activeStorageKey, setActiveStorageKey] = useState(GUEST_STORAGE_KEY);
  const [items, setItems] = useState(() => readStoredCart(GUEST_STORAGE_KEY));
  const [confirmation, setConfirmation] = useState<CartConfirmationState | null>(null);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems((current) => (current.length ? [] : current));
  }, []);

  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (authLoading || activeStorageKey === storageKey) return;

    const nextItems =
      activeStorageKey === GUEST_STORAGE_KEY && storageKey !== GUEST_STORAGE_KEY
        ? mergeCartItems(readStoredCart(storageKey), readStoredCart(GUEST_STORAGE_KEY))
        : readStoredCart(storageKey);

    if (activeStorageKey === GUEST_STORAGE_KEY && storageKey !== GUEST_STORAGE_KEY) {
      localStorage.setItem(storageKey, JSON.stringify(nextItems));
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }

    setActiveStorageKey(storageKey);
    setItems(nextItems);
    setConfirmation(null);
  }, [activeStorageKey, authLoading, storageKey]);

  useEffect(() => {
    if (authLoading) return;

    localStorage.setItem(activeStorageKey, JSON.stringify(items));
  }, [activeStorageKey, authLoading, items]);

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
