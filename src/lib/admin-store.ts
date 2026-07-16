import { useEffect, useState, useCallback } from "react";

// ============================================================
// Ratna Admin — localStorage-backed store.
// Kept simple on purpose so no backend is required. Every hook
// syncs across tabs via the "storage" event and re-hydrates on
// mount without SSR crashes.
// ============================================================

export type Reservation = {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  hall: "ratna" | "deluxe";
  hallName: string;
  seating: string;
  notes?: string;
  status: "pending" | "confirmed" | "seated" | "no-show" | "cancelled";
  table?: string;
};

export type OrderItem = { id: string; name: string; qty: number; price: number };
export type Order = {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  mode: "pickup" | "delivery";
  address?: string;
  distanceKm?: number;
  notes?: string;
  pay: "upi" | "card" | "cod";
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  gst: number;
  total: number;
  status: "new" | "preparing" | "ready" | "out" | "delivered" | "cancelled";
  rider?: string;
};

export type Enquiry = {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
};

export type MenuOverride = {
  available: boolean;
  priceOverride?: number;
};

export type Settings = {
  kitchenPaused: boolean;
  deliveryRadiusKm: number;
  hours: string;
  adminPass: string;
};

const K = {
  reservations: "ratna_admin_reservations_v1",
  orders: "ratna_admin_orders_v1",
  enquiries: "ratna_admin_enquiries_v1",
  overrides: "ratna_admin_menu_overrides_v1",
  settings: "ratna_admin_settings_v1",
  unlocked: "ratna_admin_unlocked_v1",
};

const DEFAULT_SETTINGS: Settings = {
  kitchenPaused: false,
  deliveryRadiusKm: 7,
  hours: "12:00 PM – 11:30 PM · All 7 days",
  adminPass: "ratna-admin",
};

// ---------- generic helpers ----------
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a synthetic event so same-tab listeners update.
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch { /* ignore */ }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setValue(read<T>(key, fallback));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      write(key, next);
      return next;
    });
  }, [key]);
  return [value, set, hydrated] as const;
}

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- one-shot writers (used by public forms) ----------
export function pushReservation(r: Omit<Reservation, "id" | "createdAt" | "status">) {
  const list = read<Reservation[]>(K.reservations, []);
  const full: Reservation = { ...r, id: uid(), createdAt: Date.now(), status: "pending" };
  write(K.reservations, [full, ...list]);
  return full;
}
export function pushOrder(o: Omit<Order, "id" | "createdAt" | "status">) {
  const list = read<Order[]>(K.orders, []);
  const full: Order = { ...o, id: uid(), createdAt: Date.now(), status: "new" };
  write(K.orders, [full, ...list]);
  return full;
}
export function pushEnquiry(e: Omit<Enquiry, "id" | "createdAt" | "status">) {
  const list = read<Enquiry[]>(K.enquiries, []);
  const full: Enquiry = { ...e, id: uid(), createdAt: Date.now(), status: "unread" };
  write(K.enquiries, [full, ...list]);
  return full;
}

// ---------- read functions (SSR-safe, module-scope) ----------
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(K.settings, {}) };
}
export function getOverrides(): Record<string, MenuOverride> {
  return read<Record<string, MenuOverride>>(K.overrides, {});
}
export function isAvailable(itemId: string): boolean {
  const o = getOverrides()[itemId];
  return !o || o.available !== false;
}
export function priceOverrideFor(itemId: string): number | undefined {
  return getOverrides()[itemId]?.priceOverride;
}

// ---------- hooks ----------
export function useReservations() {
  const [list, setList, hydrated] = useStored<Reservation[]>(K.reservations, []);
  return {
    list, hydrated,
    update: (id: string, patch: Partial<Reservation>) =>
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
    remove: (id: string) => setList((prev) => prev.filter((r) => r.id !== id)),
  };
}
export function useOrders() {
  const [list, setList, hydrated] = useStored<Order[]>(K.orders, []);
  return {
    list, hydrated,
    update: (id: string, patch: Partial<Order>) =>
      setList((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    remove: (id: string) => setList((prev) => prev.filter((o) => o.id !== id)),
  };
}
export function useEnquiries() {
  const [list, setList, hydrated] = useStored<Enquiry[]>(K.enquiries, []);
  return {
    list, hydrated,
    update: (id: string, patch: Partial<Enquiry>) =>
      setList((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    remove: (id: string) => setList((prev) => prev.filter((e) => e.id !== id)),
  };
}
export function useOverrides() {
  const [map, setMap, hydrated] = useStored<Record<string, MenuOverride>>(K.overrides, {});
  return {
    map, hydrated,
    set: (id: string, patch: Partial<MenuOverride>) =>
      setMap((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { available: true }), ...patch } })),
    clear: (id: string) => setMap((prev) => { const n = { ...prev }; delete n[id]; return n; }),
    reset: () => setMap({}),
  };
}
export function useSettings() {
  const [raw, setRaw, hydrated] = useStored<Partial<Settings>>(K.settings, {});
  const value: Settings = { ...DEFAULT_SETTINGS, ...raw };
  return {
    value, hydrated,
    set: (patch: Partial<Settings>) => setRaw((prev) => ({ ...prev, ...patch })),
  };
}
export function useAdminAuth() {
  const [unlocked, setUnlocked, hydrated] = useStored<boolean>(K.unlocked, false);
  return {
    unlocked, hydrated,
    unlock: (pass: string) => {
      const ok = pass === getSettings().adminPass;
      if (ok) setUnlocked(true);
      return ok;
    },
    lock: () => setUnlocked(false),
  };
}
