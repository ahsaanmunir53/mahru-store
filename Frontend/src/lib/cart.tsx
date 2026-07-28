import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { CartItem } from './types';

const KEY = 'mahru_cart_v1';

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (handle: string, size: string, qty: number) => void;
  remove: (handle: string, size: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx['add'] = (item, qty = 1) => {
    setItems((xs) => {
      const i = xs.findIndex((x) => x.handle === item.handle && x.size === item.size);
      if (i >= 0) {
        const next = [...xs];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + qty) };
        return next;
      }
      return [...xs, { ...item, qty }];
    });
    setDrawerOpen(true);
  };

  const setQty: CartCtx['setQty'] = (handle, size, qty) =>
    setItems((xs) =>
      qty <= 0
        ? xs.filter((x) => !(x.handle === handle && x.size === size))
        : xs.map((x) => (x.handle === handle && x.size === size ? { ...x, qty: Math.min(10, qty) } : x)),
    );

  const remove: CartCtx['remove'] = (handle, size) =>
    setItems((xs) => xs.filter((x) => !(x.handle === handle && x.size === size)));

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, x) => s + x.qty, 0),
      subtotal: items.reduce((s, x) => s + x.price * x.qty, 0),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      setQty,
      remove,
      clear: () => setItems([]),
    }),
    [items, drawerOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
