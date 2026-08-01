"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  unitCents: number;
  qty: number;
  imageUrl: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  setQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ciranda_cart_v1";

function sameLine(a: CartItem, productId: string, size: string, color: string) {
  return a.productId === productId && a.size === size && a.color === color;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // carrinho corrompido — recomeça vazio
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sem storage disponível — carrinho vive só em memória
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotalCents = items.reduce((sum, i) => sum + i.unitCents * i.qty, 0);
    return {
      items,
      count,
      subtotalCents,
      addItem: (item, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => sameLine(p, item.productId, item.size, item.color));
          if (existing) {
            return prev.map((p) =>
              sameLine(p, item.productId, item.size, item.color)
                ? { ...p, qty: Math.min(10, p.qty + qty) }
                : p
            );
          }
          return [...prev, { ...item, qty }];
        }),
      removeItem: (productId, size, color) =>
        setItems((prev) => prev.filter((p) => !sameLine(p, productId, size, color))),
      setQty: (productId, size, color, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => !sameLine(p, productId, size, color))
            : prev.map((p) =>
                sameLine(p, productId, size, color) ? { ...p, qty: Math.min(10, qty) } : p
              )
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>.");
  return ctx;
}
