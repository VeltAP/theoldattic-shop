'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  quantity: number;
};

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

// --- The "external store": localStorage itself, plus a tiny pub/sub ---

const listeners = new Set<() => void>();
function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Also react if the cart changes in ANOTHER browser tab
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) emitChange();
  }
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

// useSyncExternalStore requires getSnapshot to return the SAME reference
// if nothing changed, so we cache the parsed result and only reparse
// when the raw string actually differs.
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = [];
const EMPTY_CART: CartItem[] = [];

function getSnapshot(): CartItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedItems = raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      cachedItems = [];
    }
  }
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART; // server always sees an empty cart — matches client's first paint
}

function writeCart(items: CartItem[]) {
  cachedItems = items;
  cachedRaw = JSON.stringify(items);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  emitChange();
}

// --- The actual Provider ---

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    const current = getSnapshot();
    const existing = current.find((i) => i.productId === item.productId);
    const next = existing
      ? current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...current, { ...item, quantity }];
    writeCart(next);
  }

  function removeItem(productId: string) {
    writeCart(getSnapshot().filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    writeCart(
      getSnapshot().map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    writeCart([]);
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