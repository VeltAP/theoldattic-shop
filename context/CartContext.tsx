'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Shape of one item sitting in the cart
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  quantity: number;
};

// Everything the rest of the app is allowed to do with the cart
type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'vintage-shop-cart';

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch (error) {
    console.warn('Failed to load cart from storage', error);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCartFromStorage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  function addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    setItems((current) => {
      const existing = current.find((i) => i.productId === item.productId);
      if (existing) {
        return current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...current, { ...item, quantity }];
    });
  }

  function removeItem(productId: string) {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}