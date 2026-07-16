import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Users, Phone, Loader2, CheckCircle2, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { RESTAURANT, LOCATIONS, getLocation } from "@/data/menu";
import { pushReservation } from "@/lib/admin-store";

export const Route = createFileRoute("/reserve")({
  head: () => ({ meta: [
    { title: "Reserve a Table — Ratna Deluxe" },
    { name: "description", content: "Reserve your table at Ratna Deluxe, Kushaiguda. Family dinners, date nights, small celebrations — book in seconds." },
  ] }),
  component: ReservePage,
});

function ReservePage() {
  const [step, setStep] = useState<"form" | "done">("form");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [date, setDate] = useState(""); const [time, setTime] = useState("20:00");
  const [guests, setGuests] = useState(4); const [seating, setSeating] = useState("deluxe");
  const [notes, setNotes] = useState("");
  const [locId, setLocId] = useState<"ratna" | "deluxe">("deluxe");
  const location = getLocation(locId);
  const BOOKING_FEE = 200;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) { toast.error("Please fill name, phone and date"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    pushReservation({
      name: name.trim(), phone: phone.trim(), date, time, guests,
      hall: locId, hallName: location.name, seating, notes: notes.trim() || undefined,
    });
    setBusy(false); setStep("done");
  };

  if (step === "done") return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--emerald)]/10"><CheckCircle2 className="h-12 w-12 text-[var(--emerald)]" /></div>
        <h1 className="mt-6 font-serif text-4xl italic">Table reserved at {location.name}</h1>
        <p className="mt-3 text-muted-foreground">We've noted <b>{guests}</b> guests on <b>{date}</b> at <b>{time}</b> in the <b>{location.name}</b> hall. Your <b>₹{BOOKING_FEE}</b> booking fee is fully adjusted against your final bill. Our manager will confirm on {phone} shortly.</p>
        <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]"><Phone className="h-4 w-4" /> Call to confirm</a>
      </div>
      <SiteFooter />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <header className="bg-[var(--emerald-deep)] px-6 py-16 text-center text-[var(--ivory)]">
        <p className="eyebrow text-[var(--brass)]"><span className="ornament">Table for you</span></p>
        <h1 className="mt-4 font-serif text-5xl italic md:text-7xl">Reserve a Table</h1>
        <p className="mx-auto mt-4 max-w-lg text-[var(--ivory)]/75">Two dining rooms under one roof — pick the room that fits your evening.</p>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        {/* Which restaurant */}
        <div className="mb-6 rounded-sm border border-[var(--brass)]/25 bg-white p-6 md:p-8">
          <p className="eyebrow text-[var(--emerald)]">Step 1 · Choose your Ratna</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {LOCATIONS.map((l) => {
              const selected = locId === l.id;
              return (
                <button type="button" key={l.id} onClick={() => setLocId(l.id)}
                  className={`text-left rounded-sm border p-5 transition ${selected ? "border-[var(--emerald-deep)] bg-[var(--emerald)]/5 ring-2 ring-[var(--emerald-deep)]" : "border-border hover:border-[var(--brass)]"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl italic text-[var(--emerald-deep)]">{l.name}</h3>
                    {l.ac && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]"><Snowflake className="h-3 w-3" /> A/C</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{l.tagline}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-widest text-[var(--brass)] font-bold">{l.seats} seats · {l.priceMultiplier > 1 ? `+${Math.round((l.priceMultiplier - 1) * 100)}% A/C service` : "Base menu pricing"}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{location.reserveNote}</p>
        </div>

        <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6 md:p-8">
          <p className="eyebrow mb-5 text-[var(--emerald)]">Step 2 · Your details</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <F label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} /></F>
            <F label="Phone"><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} placeholder="+91 …" /></F>
            <F label={<span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</span>}>
              <input required type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
            </F>
            <F label={<span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> Time</span>}>
              <select value={time} onChange={(e) => setTime(e.target.value)} className={inp}>
                {["12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
            <F label={<span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3" /> Guests</span>}>
              <div className="flex items-center gap-2 rounded-sm border border-border bg-white p-1">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-9 w-9 rounded-sm hover:bg-secondary">−</button>
                <span className="flex-1 text-center font-bold">{guests}</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(40, g + 1))} className="h-9 w-9 rounded-sm hover:bg-secondary">+</button>
              </div>
            </F>
            <F label="Seating preference">
              <select value={seating} onChange={(e) => setSeating(e.target.value)} className={inp}>
                <option value="family">Family section</option>
                <option value="quiet">Quiet corner (for two)</option>
                <option value="private">Private area (8+ guests)</option>
                <option value="any">Any available</option>
              </select>
            </F>
          </div>
          <div className="mt-4">
            <F label="Occasion / special requests (optional)">
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 300))} placeholder="Birthday cake, wheelchair access, high chair…" className={inp + " resize-none"} />
            </F>
          </div>
          <button disabled={busy} className="mt-6 w-full rounded-full bg-[var(--emerald-deep)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)] disabled:opacity-60">
            {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : `Pay ₹${BOOKING_FEE} & Reserve · ${guests} guests`}
          </button>
          <div className="mt-4 rounded-sm border border-[var(--brass)]/30 bg-[var(--brass)]/5 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">₹{BOOKING_FEE} nominal booking fee</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Fully adjusted against your final bill. Refundable if cancelled 3+ hours before your slot. Prevents no-shows and keeps your table held.</p>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Groups of 8+? Please also call {RESTAURANT.phoneShort} to confirm arrangement.</p>
        </div>
      </form>
      <SiteFooter />
    </div>
  );
}

const inp = "w-full rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]";
function F({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>{children}</label>;
}