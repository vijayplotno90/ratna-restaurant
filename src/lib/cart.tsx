import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  itemId: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  portion?: "half" | "full";
  notes?: string;
};

type AddInput = Omit<CartItem, "key" | "qty"> & { qty?: number };

type CartCtx = {
  items: CartItem[];
  add: (input: AddInput) => void;
  update: (key: string, patch: Partial<Pick<CartItem, "qty" | "notes">>) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "ratna_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, hydrated]);

  const add = useCallback((input: AddInput) => {
    const key = `${input.itemId}::${input.portion ?? "single"}::${input.notes ?? ""}`;
    setItems((prev) => {
      const existing = prev.find((p) => p.key === key);
      if (existing) {
        return prev.map((p) => p.key === key ? { ...p, qty: p.qty + (input.qty ?? 1) } : p);
      }
      return [...prev, { ...input, key, qty: input.qty ?? 1 }];
    });
  }, []);

  const update = useCallback((key: string, patch: Partial<Pick<CartItem, "qty" | "notes">>) => {
    setItems((prev) => prev.map((p) => p.key === key ? { ...p, ...patch } : p).filter((p) => p.qty > 0));
  }, []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => ({
    items, add, update, remove, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.unitPrice, 0),
  }), [items, add, update, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
