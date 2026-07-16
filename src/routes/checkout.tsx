import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Store, CreditCard, Wallet, Smartphone, Loader2, Check, MapPin, AlertTriangle, Phone } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { RESTAURANT } from "@/data/menu";
import { pushOrder } from "@/lib/admin-store";
import { useSettings } from "@/lib/admin-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ratna Deluxe" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { value: settings } = useSettings();
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<"upi" | "card" | "cod">("upi");
  const [busy, setBusy] = useState(false);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "ok" | "far" | "denied">("idle");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const checkLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("denied"); toast.error("Location not supported on this device"); return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversineKm(pos.coords.latitude, pos.coords.longitude, RESTAURANT.lat, RESTAURANT.lng);
        setDistanceKm(d);
        if (d <= settings.deliveryRadiusKm) { setGeoState("ok"); toast.success(`You're ${d.toFixed(1)} km away — we deliver!`); }
        else { setGeoState("far"); }
      },
      () => { setGeoState("denied"); toast.error("Couldn't read location — please allow permission or call us"); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const delivery = mode === "pickup" ? 0 : 40;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + gst;
  const deliveryBlocked = mode === "delivery" && (geoState === "idle" || geoState === "far" || geoState === "denied");

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--ivory)]">
        <SiteNav />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-serif text-3xl italic">Your order is empty</h1>
          <Link to="/menu" className="mt-6 inline-block rounded-full bg-[var(--emerald-deep)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">Browse menu</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.kitchenPaused) { toast.error("Kitchen paused — online orders are temporarily disabled. Please call us."); return; }
    if (!name.trim() || !phone.trim()) { toast.error("Please add your name and phone"); return; }
    if (mode === "delivery" && !address.trim()) { toast.error("Please add delivery address"); return; }
    if (mode === "delivery" && geoState !== "ok") { toast.error("Please verify your location is within our delivery radius"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, pay === "cod" ? 600 : 1500));
    const orderItems = items.map((it) => ({ id: it.itemId, name: it.name, qty: it.qty, price: it.unitPrice }));
    const saved = pushOrder({
      name: name.trim(), phone: phone.trim(), mode,
      address: mode === "delivery" ? address.trim() : undefined,
      distanceKm: distanceKm ?? undefined,
      notes: notes.trim() || undefined,
      pay, items: orderItems, subtotal, delivery, gst, total,
    });
    clear();
    navigate({ to: "/order/$id", params: { id: saved.id } });
  };

  if (busy) return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--emerald)]" />
          <h2 className="mt-6 font-serif text-2xl">{pay === "cod" ? "Placing your order…" : "Processing payment…"}</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <h1 className="font-serif text-4xl italic md:text-5xl">Checkout</h1>

          <Section title="How would you like it?">
            <div className="grid grid-cols-2 gap-3">
              <ModeBtn active={mode === "pickup"} onClick={() => setMode("pickup")} icon={Store} title="Takeaway" sub="Ready in 20 min · Free" />
              <ModeBtn active={mode === "delivery"} onClick={() => setMode("delivery")} icon={Bike} title="Delivery" sub="Nearby only · ₹40" />
            </div>
          </Section>

          <Section title="Your details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name"><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} /></Field>
              <Field label="Phone"><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} placeholder="+91 …" /></Field>
            </div>
          </Section>

          {mode === "delivery" && (
            <Section title="Delivery address">
              <div className="mb-3 rounded-sm border border-[var(--brass)]/30 bg-[var(--brass)]/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--emerald-deep)]">Delivery radius: {settings.deliveryRadiusKm} km</p>
                      <p className="text-[11px] text-muted-foreground">We deliver hot food within {settings.deliveryRadiusKm} km of Chakripuram. Verify your location first.</p>
                    </div>
                  </div>
                  {geoState !== "ok" && (
                    <button type="button" onClick={checkLocation} disabled={geoState === "locating"}
                      className="shrink-0 rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)] disabled:opacity-60">
                      {geoState === "locating" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Use my location"}
                    </button>
                  )}
                </div>
                {geoState === "ok" && distanceKm !== null && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--emerald)]"><Check className="h-3 w-3" /> Verified · {distanceKm.toFixed(1)} km from us — delivery available.</p>
                )}
                {geoState === "far" && distanceKm !== null && (
                  <div className="mt-3 rounded-sm border border-red-300 bg-red-50 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-700"><AlertTriangle className="h-3 w-3" /> Out of delivery zone</p>
                    <p className="mt-1 text-xs text-red-800">You're <b>{distanceKm.toFixed(1)} km</b> away — beyond our {settings.deliveryRadiusKm} km hot-food radius. Please call us to arrange or switch to <button type="button" onClick={() => setMode("pickup")} className="underline">takeaway</button>.</p>
                    <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white"><Phone className="h-3 w-3" /> Call {RESTAURANT.phoneShort}</a>
                  </div>
                )}
                {geoState === "denied" && (
                  <p className="mt-2 text-[11px] text-red-700">Location permission blocked. Please enable it or call {RESTAURANT.phoneShort} to order.</p>
                )}
              </div>
              <textarea required value={address} onChange={(e) => setAddress(e.target.value.slice(0, 300))} rows={3} placeholder="Flat / house no., street, area, pincode" className={inp + " resize-none"} />
            </Section>
          )}

          <Section title="Notes for kitchen (optional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 300))} rows={2} placeholder="Allergies, spice preferences, cutlery…" className={inp + " resize-none"} />
          </Section>

          <Section title="Payment">
            <div className="grid grid-cols-3 gap-2">
              <PayOpt icon={Smartphone} label="UPI" active={pay === "upi"} onClick={() => setPay("upi")} />
              <PayOpt icon={CreditCard} label="Card" active={pay === "card"} onClick={() => setPay("card")} />
              <PayOpt icon={Wallet} label="Cash" active={pay === "cod"} onClick={() => setPay("cod")} />
            </div>
            {pay !== "cod" && <p className="mt-3 rounded bg-[var(--brass)]/10 px-3 py-2 text-xs"><Check className="mr-1 inline h-3 w-3" /> Demo mode — payment auto-confirmed.</p>}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
            <h3 className="font-serif text-2xl">Order Summary</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-2"><span>{i.qty} × {i.name}</span><span className="font-semibold">₹{i.unitPrice * i.qty}</span></li>
              ))}
            </ul>
            <div className="my-4 brass-rule" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{mode === "pickup" ? "Pickup" : "Delivery"}</span><span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst}</span></div>
            </div>
            <div className="my-4 brass-rule" />
            <div className="flex justify-between font-serif text-2xl italic"><span>Total</span><span className="text-[var(--emerald-deep)]">₹{total}</span></div>
            <button type="submit" disabled={deliveryBlocked} className="mt-5 w-full rounded-full bg-[var(--emerald-deep)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)] disabled:cursor-not-allowed disabled:opacity-50">
              {deliveryBlocked ? "Verify location first" : pay === "cod" ? "Place Order" : `Pay ₹${total}`}
            </button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Or call {RESTAURANT.phoneShort}</p>
          </div>
        </aside>
      </form>
      <SiteFooter />
    </div>
  );
}

const inp = "w-full rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-sm border border-[var(--brass)]/25 bg-white p-5"><h3 className="mb-3 font-serif text-lg">{title}</h3>{children}</section>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>{children}</label>;
}
function ModeBtn({ active, onClick, icon: Icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ElementType; title: string; sub: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-start rounded-sm border-2 p-4 text-left transition ${active ? "border-[var(--emerald)] bg-[var(--emerald)]/5" : "border-border"}`}>
      <Icon className={`h-5 w-5 ${active ? "text-[var(--emerald)]" : "text-muted-foreground"}`} />
      <p className="mt-2 font-serif text-lg">{title}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </button>
  );
}
function PayOpt({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center gap-1.5 rounded-sm border-2 p-3 text-xs font-semibold transition ${active ? "border-[var(--emerald)] bg-[var(--emerald)]/5 text-[var(--emerald-deep)]" : "border-border"}`}>
      <Icon className="h-5 w-5" /> {label}
    </button>
  );
}
