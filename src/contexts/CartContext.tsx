import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CartItem } from '../types';

const STORAGE_KEY = 'tra-tan-cuong-cart';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  total: number;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItemsState] = useState<CartItem[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setItemsState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItemsState((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + item.quantity,
          total: (next[idx].unitPrice || next[idx].total / next[idx].quantity) * (next[idx].quantity + item.quantity),
        };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItemsState((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItemsState((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItemsState((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity, total: i.unitPrice * quantity } : i
      )
    );
  }, []);

  const setItems = useCallback((newItems: CartItem[]) => {
    setItemsState(newItems);
  }, []);

  const total = items.reduce((sum, i) => sum + i.total, 0);

  const clear = useCallback(() => setItemsState([]), []);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, setItems, total, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
