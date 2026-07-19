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

export type CustomerProfile = {
  phone: string;
  email?: string;
  birthday?: string;
  anniversary?: string;
  preferences?: string[];
  notes?: string;
  consent: boolean;
};

export type Automation = {
  id: string;
  name: string;
  audience: "new" | "regular" | "at-risk" | "vip" | "all";
  trigger: "scheduled" | "birthday" | "anniversary" | "festival";
  schedule: string;
  message: string;
  enabled: boolean;
  lastRun?: number;
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

export type HomepageSpecial = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  link: string;
  kind: "signature" | "weekday" | "festival" | "occasion" | "offer";
  enabled: boolean;
  weekdays?: number[];
  startDate?: string;
  endDate?: string;
};

const K = {
  reservations: "ratna_admin_reservations_v1",
  orders: "ratna_admin_orders_v1",
  enquiries: "ratna_admin_enquiries_v1",
  overrides: "ratna_admin_menu_overrides_v1",
  settings: "ratna_admin_settings_v1",
  customerProfiles: "ratna_admin_customer_profiles_v1",
  automations: "ratna_admin_automations_v1",
  specials: "ratna_admin_homepage_specials_v1",
  unlocked: "ratna_admin_unlocked_v1",
};

// The staff session is deliberately separate from the operational demo data.
// Keeping a small same-site cookie means a verified login survives the route
// transition even if the browser delays localStorage hydration.
const ADMIN_SESSION_COOKIE = "ratna_admin_session_v1";

function hasAdminSession() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((item) => item.trim() === `${ADMIN_SESSION_COOKIE}=1`);
}

function setAdminSession(active: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${active ? "1" : ""}; Path=/; Max-Age=${active ? 60 * 60 * 8 : 0}; SameSite=Lax`;
}

const DEFAULT_SETTINGS: Settings = {
  kitchenPaused: false,
  deliveryRadiusKm: 7,
  hours: "12:00 PM – 11:30 PM · All 7 days",
  adminPass: "0000",
};

// These are intentionally labelled demo records. They let a prospective Ratna
// owner see the operational views before real checkouts begin feeding them.
const ago = (days: number, hour = 13) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.getTime();
};
const minutesAgo = (minutes: number) => Date.now() - minutes * 60 * 1000;

export const DEMO_ORDERS: Order[] = [
  {
    id: "demo-1009",
    createdAt: minutesAgo(7),
    name: "Sana Begum",
    phone: "9876543214",
    mode: "delivery",
    address: "Kapra, Hyderabad",
    distanceKm: 5.1,
    pay: "upi",
    items: [{ id: "tandoori-chicken", name: "Tandoori Chicken (Half)", qty: 1, price: 240 }, { id: "butter-naan", name: "Butter Naan", qty: 2, price: 50 }],
    subtotal: 340,
    delivery: 0,
    gst: 17,
    total: 357,
    status: "ready",
  },
  {
    id: "demo-1008",
    createdAt: minutesAgo(18),
    name: "Aarav Reddy",
    phone: "9876543210",
    mode: "delivery",
    address: "Sainikpuri, Hyderabad",
    distanceKm: 3.2,
    pay: "upi",
    items: [
      { id: "chicken-dum-biryani", name: "Chicken Dum Biryani", qty: 2, price: 320 },
      { id: "double-ka-meetha", name: "Double Ka Meetha", qty: 1, price: 110 },
    ],
    subtotal: 750,
    delivery: 0,
    gst: 38,
    total: 788,
    status: "out",
    rider: "Rafi",
  },
  {
    id: "demo-1007",
    createdAt: minutesAgo(42),
    name: "Meera Shah",
    phone: "9876543211",
    mode: "pickup",
    pay: "card",
    items: [
      { id: "paneer-tikka", name: "Paneer Tikka", qty: 1, price: 280 },
      { id: "butter-naan", name: "Butter Naan", qty: 3, price: 55 },
    ],
    subtotal: 445,
    delivery: 0,
    gst: 22,
    total: 467,
    status: "ready",
  },
  {
    id: "demo-1006",
    createdAt: minutesAgo(88),
    name: "Aarav Reddy",
    phone: "9876543210",
    mode: "delivery",
    address: "Sainikpuri, Hyderabad",
    distanceKm: 3.2,
    pay: "upi",
    items: [
      { id: "chicken-65", name: "Chicken 65", qty: 1, price: 220 },
      { id: "veg-fried-rice", name: "Veg Fried Rice", qty: 1, price: 180 },
    ],
    subtotal: 400,
    delivery: 0,
    gst: 20,
    total: 420,
    status: "delivered",
    rider: "Rafi",
  },
  {
    id: "demo-1005",
    createdAt: minutesAgo(137),
    name: "Nikhil Varma",
    phone: "9876543212",
    mode: "pickup",
    pay: "upi",
    items: [
      { id: "mutton-dum-biryani", name: "Mutton Dum Biryani", qty: 1, price: 390 },
      { id: "fresh-lime-soda", name: "Fresh Lime Soda", qty: 2, price: 70 },
    ],
    subtotal: 530,
    delivery: 0,
    gst: 27,
    total: 557,
    status: "delivered",
  },
  {
    id: "demo-1004",
    createdAt: ago(18, 20),
    name: "Fatima Khan",
    phone: "9876543213",
    mode: "delivery",
    address: "ECIL, Hyderabad",
    distanceKm: 4.8,
    pay: "cod",
    items: [
      { id: "veg-dum-biryani", name: "Veg Dum Biryani", qty: 2, price: 230 },
      { id: "gulab-jamun", name: "Gulab Jamun", qty: 2, price: 90 },
    ],
    subtotal: 640,
    delivery: 30,
    gst: 34,
    total: 704,
    status: "delivered",
    rider: "Sameer",
  },
  {
    id: "demo-1003",
    createdAt: ago(34, 12),
    name: "Nikhil Varma",
    phone: "9876543212",
    mode: "pickup",
    pay: "card",
    items: [
      { id: "chicken-tikka", name: "Chicken Tikka", qty: 1, price: 260 },
      { id: "butter-naan", name: "Butter Naan", qty: 2, price: 55 },
    ],
    subtotal: 370,
    delivery: 0,
    gst: 19,
    total: 389,
    status: "delivered",
  },
  {
    id: "demo-1002",
    createdAt: ago(47, 19),
    name: "Aarav Reddy",
    phone: "9876543210",
    mode: "delivery",
    address: "Sainikpuri, Hyderabad",
    distanceKm: 3.2,
    pay: "upi",
    items: [
      { id: "chicken-frypiece-biryani", name: "Chicken Fry Piece Biryani", qty: 1, price: 340 },
    ],
    subtotal: 340,
    delivery: 0,
    gst: 17,
    total: 357,
    status: "delivered",
    rider: "Rafi",
  },
  {
    id: "demo-1001",
    createdAt: ago(64, 13),
    name: "Saanvi Rao",
    phone: "9876543214",
    mode: "pickup",
    pay: "upi",
    items: [
      { id: "paneer-butter-masala", name: "Paneer Butter Masala", qty: 1, price: 240 },
      { id: "tandoori-roti", name: "Tandoori Roti", qty: 4, price: 35 },
    ],
    subtotal: 380,
    delivery: 0,
    gst: 19,
    total: 399,
    status: "delivered",
  },
];

export const DEMO_CUSTOMER_PROFILES: CustomerProfile[] = [
  {
    phone: "9876543210",
    email: "aarav.demo@example.com",
    birthday: "1992-08-18",
    anniversary: "2019-12-06",
    preferences: ["Chicken biryani", "UPI", "Delivery"],
    notes: "Prefers mild spice. Consent recorded for offers.",
    consent: true,
  },
  {
    phone: "9876543211",
    email: "meera.demo@example.com",
    birthday: "1995-03-24",
    preferences: ["Vegetarian", "Paneer", "Pickup"],
    notes: "Likes early-evening pickup reminders.",
    consent: true,
  },
  {
    phone: "9876543212",
    email: "nikhil.demo@example.com",
    birthday: "1988-11-10",
    preferences: ["Mutton", "Chicken starters"],
    notes: "Good candidate for weekend family-pack campaign.",
    consent: true,
  },
  {
    phone: "9876543213",
    preferences: ["Vegetarian", "COD", "Family meals"],
    notes: "No marketing consent — show only service messages.",
    consent: false,
  },
  {
    phone: "9876543214",
    email: "saanvi.demo@example.com",
    birthday: "1997-01-31",
    preferences: ["Vegetarian", "North Indian"],
    consent: true,
  },
];

export const DEMO_AUTOMATIONS: Automation[] = [
  {
    id: "demo-auto-lunch",
    name: "Weekday lunch reminder",
    audience: "regular",
    trigger: "scheduled",
    schedule: "Mon–Fri · 12:15 PM",
    message:
      "Hi {name}, Ratna lunch is ready. Enjoy a complimentary drink on orders above ₹499 today.",
    enabled: true,
    lastRun: ago(1, 12),
  },
  {
    id: "demo-auto-winback",
    name: "30-day return offer",
    audience: "at-risk",
    trigger: "scheduled",
    schedule: "Every Tuesday · 6:30 PM",
    message:
      "Hi {name}, we miss you at Ratna. Come back this week and enjoy 10% off with code WELCOMEHOME.",
    enabled: true,
    lastRun: ago(6, 18),
  },
  {
    id: "demo-auto-birthday",
    name: "Birthday greeting",
    audience: "all",
    trigger: "birthday",
    schedule: "On birthday · 10:00 AM",
    message: "Happy birthday, {name}! Celebrate with a complimentary dessert at Ratna this month.",
    enabled: true,
  },
];

export const DEMO_HOMEPAGE_SPECIALS: HomepageSpecial[] = [
  { id: "signature-biryani", title: "Ratna Signature Chicken Dum Biryani", eyebrow: "Signature since 2004", description: "Handi-sealed dum biryani, fragrant basmati and tender chicken — the plate Ratna is known for.", image: "chicken-dum-biryani", link: "/dish/chicken-biryani", kind: "signature", enabled: true },
  { id: "signature-frypiece", title: "Chicken Fry Piece Biryani", eyebrow: "Ratna crowd favourite", description: "Crisp, spicy fry pieces layered into fragrant dum rice — one of Ratna's most-ordered biryanis.", image: "chicken-fry-piece-biryani", link: "/menu", kind: "signature", enabled: true },
  { id: "signature-mutton", title: "Mutton Dum Biryani", eyebrow: "Slow-cooked handi", description: "Tender mutton, aged basmati and patient dum cooking for a truly Hyderabadi biryani plate.", image: "mutton-dum-biryani", link: "/menu", kind: "signature", enabled: true },
  { id: "signature-majestic", title: "Paneer Majestic", eyebrow: "Vegetarian favourite", description: "Crisp paneer tossed in Ratna's signature spicy, creamy Hyderabadi-style masala.", image: "paneer-majestic", link: "/menu", kind: "signature", enabled: true },
  { id: "signature-chicken65", title: "Chicken 65, Fresh & Fiery", eyebrow: "Starter spotlight", description: "A sizzling Ratna classic: fried chicken, curry leaves and the right amount of heat.", image: "chicken-65", link: "/menu", kind: "signature", enabled: true },
  { id: "signature-tikka", title: "Live Tandoor Chicken Tikka", eyebrow: "From live charcoal", description: "Smoky chicken tikka straight from the tandoor — best shared at the table.", image: "chicken-tikka", link: "/menu", kind: "signature", enabled: true },
  { id: "monday-family", title: "Monday Family Table", eyebrow: "Monday special", description: "Start the week together: order two biryanis and add a Double Ka Meetha for the family table.", image: "double-ka-meetha", link: "/menu", kind: "weekday", weekdays: [1], enabled: true },
  { id: "tuesday-tandoor", title: "Fresh From The Tandoor", eyebrow: "Tuesday special", description: "Chicken Tikka and live-charcoal tandoor favourites, served fresh from 6 PM.", image: "chicken-tikka", link: "/menu", kind: "weekday", weekdays: [2], enabled: true },
  { id: "wednesday-veg", title: "Midweek Veg Feast", eyebrow: "Wednesday special", description: "Paneer Majestic, rich curries and fresh naan for a relaxed vegetarian dinner.", image: "paneer-majestic", link: "/menu", kind: "weekday", weekdays: [3], enabled: true },
  { id: "thursday-kebabs", title: "Thursday Kebab Night", eyebrow: "Thursday special", description: "Gather over Chicken 65, seekh kebabs and tandoor-fired starters.", image: "chicken-65", link: "/menu", kind: "weekday", weekdays: [4], enabled: true },
  { id: "friday-biryani", title: "Friday Biryani Night", eyebrow: "Friday special", description: "Make Friday delicious with our signature dum biryani and a complimentary raita upgrade.", image: "mutton-dum-biryani", link: "/menu", kind: "weekday", weekdays: [5], enabled: true },
  { id: "sunday-family", title: "Sunday Family Biryani Feast", eyebrow: "Sunday special", description: "Slow down together over a generous family biryani meal at Ratna.", image: "chicken-fry-piece-biryani", link: "/menu", kind: "weekday", weekdays: [0], enabled: true },
  { id: "birthday-treat", title: "A Sweet Birthday Treat From Ratna", eyebrow: "Birthday celebration", description: "Celebrate your birthday with us and ask our team about your complimentary sweet treat.", image: "gulab-jamun", link: "/reserve", kind: "occasion", enabled: true },
  { id: "ugadi-2027", title: "Ugadi Wishes From Ratna", eyebrow: "Festival greeting · 7 Apr 2027", description: "Warm Ugadi wishes to you and your family. Celebrate the Telugu New Year with a Ratna family feast.", image: "kashmir-pulao", link: "/menu", kind: "festival", startDate: "2027-04-07", endDate: "2027-04-08", enabled: true },
];

export const DEMO_ENQUIRIES: Enquiry[] = [
  { id: "enq-demo-1", createdAt: minutesAgo(9), name: "Kavya Reddy", phone: "9876543230", message: "Need a family table for 12 on Saturday at 8 PM. Do you have a non-veg set menu?", status: "unread" },
  { id: "enq-demo-2", createdAt: minutesAgo(56), name: "Suresh Kumar", phone: "9876543231", message: "Please share the corporate lunch package for 35 people at our ECIL office.", status: "read" },
  { id: "enq-demo-3", createdAt: minutesAgo(123), name: "Farah Ali", phone: "9876543232", message: "Is the private dining area available for an anniversary dinner next Friday?", status: "replied" },
];

export const DEMO_RESERVATIONS: Reservation[] = [
  { id: "res-demo-1", createdAt: minutesAgo(14), name: "Priya Nair", phone: "9876543240", date: new Date().toISOString().slice(0, 10), time: "8:00 PM", guests: 6, hall: "deluxe", hallName: "Ratna Deluxe", seating: "Family table", status: "pending" },
  { id: "res-demo-2", createdAt: minutesAgo(67), name: "Rohit Gupta", phone: "9876543241", date: new Date().toISOString().slice(0, 10), time: "7:30 PM", guests: 4, hall: "ratna", hallName: "Ratna", seating: "Window side", status: "confirmed" },
  { id: "res-demo-3", createdAt: minutesAgo(158), name: "Ayesha Khan", phone: "9876543242", date: new Date().toISOString().slice(0, 10), time: "9:00 PM", guests: 10, hall: "deluxe", hallName: "Ratna Deluxe", seating: "Celebration table", notes: "Anniversary cake", status: "pending" },
];

// ---------- generic helpers ----------
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a synthetic event so same-tab listeners update.
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    /* ignore */
  }
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
  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        write(key, next);
        return next;
      });
    },
    [key],
  );
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
  const list = read<Order[]>(K.orders, DEMO_ORDERS);
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
  const [list, setList, hydrated] = useStored<Reservation[]>(K.reservations, DEMO_RESERVATIONS);
  return {
    list,
    hydrated,
    update: (id: string, patch: Partial<Reservation>) =>
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
    remove: (id: string) => setList((prev) => prev.filter((r) => r.id !== id)),
  };
}
export function useOrders() {
  const [list, setList, hydrated] = useStored<Order[]>(K.orders, DEMO_ORDERS);
  return {
    list,
    hydrated,
    update: (id: string, patch: Partial<Order>) =>
      setList((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    remove: (id: string) => setList((prev) => prev.filter((o) => o.id !== id)),
  };
}
export function useCustomerProfiles() {
  const [list, setList, hydrated] = useStored<CustomerProfile[]>(
    K.customerProfiles,
    DEMO_CUSTOMER_PROFILES,
  );
  return {
    list,
    hydrated,
    update: (phone: string, patch: Partial<CustomerProfile>) =>
      setList((prev) =>
        prev.map((profile) => (profile.phone === phone ? { ...profile, ...patch } : profile)),
      ),
  };
}
export function useAutomations() {
  const [list, setList, hydrated] = useStored<Automation[]>(K.automations, DEMO_AUTOMATIONS);
  return {
    list,
    hydrated,
    update: (id: string, patch: Partial<Automation>) =>
      setList((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item))),
  };
}
export function useHomepageSpecials() {
  const [list, setList, hydrated] = useStored<HomepageSpecial[]>(K.specials, DEMO_HOMEPAGE_SPECIALS);
  return {
    list, hydrated,
    add: (item: Omit<HomepageSpecial, "id">) => setList((prev) => [{ ...item, id: uid() }, ...prev]),
    update: (id: string, patch: Partial<HomepageSpecial>) => setList((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item)),
    remove: (id: string) => setList((prev) => prev.filter((item) => item.id !== id)),
  };
}
export function useEnquiries() {
  const [list, setList, hydrated] = useStored<Enquiry[]>(K.enquiries, DEMO_ENQUIRIES);
  return {
    list,
    hydrated,
    update: (id: string, patch: Partial<Enquiry>) =>
      setList((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    remove: (id: string) => setList((prev) => prev.filter((e) => e.id !== id)),
  };
}
export function useOverrides() {
  const [map, setMap, hydrated] = useStored<Record<string, MenuOverride>>(K.overrides, {});
  return {
    map,
    hydrated,
    set: (id: string, patch: Partial<MenuOverride>) =>
      setMap((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { available: true }), ...patch } })),
    clear: (id: string) =>
      setMap((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      }),
    reset: () => setMap({}),
  };
}
export function useSettings() {
  const [raw, setRaw, hydrated] = useStored<Partial<Settings>>(K.settings, {});
  const value: Settings = { ...DEFAULT_SETTINGS, ...raw };
  return {
    value,
    hydrated,
    set: (patch: Partial<Settings>) => setRaw((prev) => ({ ...prev, ...patch })),
  };
}
export function useAdminAuth() {
  const [unlocked, setUnlocked, hydrated] = useStored<boolean>(K.unlocked, false);
  const sessionUnlocked = hasAdminSession();
  return {
    unlocked: unlocked || sessionUnlocked,
    hydrated,
    unlock: (pass: string) => {
      const ok = pass === getSettings().adminPass;
      if (ok) {
        setAdminSession(true);
        setUnlocked(true);
      }
      return ok;
    },
    unlockVerified: () => {
      setAdminSession(true);
      setUnlocked(true);
    },
    lock: () => {
      setAdminSession(false);
      setUnlocked(false);
    },
  };
}
