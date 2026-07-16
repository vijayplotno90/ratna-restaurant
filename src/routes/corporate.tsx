import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Utensils, Presentation, Loader2, CheckCircle2, Phone } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { RESTAURANT } from "@/data/menu";
import teamDinner from "@/assets/team-dinner.jpg";

export const Route = createFileRoute("/corporate")({
  head: () => ({ meta: [
    { title: "Corporate & Team Lunches — Ratna Deluxe" },
    { name: "description", content: "Team lunches, off-sites and corporate dinners at Ratna Deluxe, Kushaiguda. Set menus, private sections, dedicated coordinator." },
    { property: "og:image", content: teamDinner },
  ] }),
  component: CorporatePage,
});

const PACKAGES = [
  { id: "veg", name: "Signature Veg Thali", price: 399, includes: ["Welcome mocktail", "2 starters", "3 mains + rice + breads", "Dessert"], min: 8 },
  { id: "mixed", name: "Team Feast (Veg + Non-Veg)", price: 599, includes: ["Welcome drinks", "4 starters (2v/2nv)", "Biryani + curries + breads", "2 desserts"], min: 10, popular: true },
  { id: "premium", name: "Executive Dinner", price: 899, includes: ["Reserved section", "5 starters + tandoori platter", "Biryani + 4 mains + breads", "Dessert platter + tea/coffee"], min: 12 },
];

function CorporatePage() {
  const [pkg, setPkg] = useState("mixed");
  const [count, setCount] = useState(20);
  const [vegCount, setVegCount] = useState(10);
  const [company, setCompany] = useState(""); const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [date, setDate] = useState(""); const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);

  const selected = PACKAGES.find((p) => p.id === pkg)!;
  const estimate = selected.price * count;
  const nonVegCount = Math.max(0, count - vegCount);

  const setCountSafe = (n: number) => {
    const clamped = Math.min(200, Math.max(selected.min, isFinite(n) ? Math.floor(n) : selected.min));
    setCount(clamped);
    if (vegCount > clamped) setVegCount(clamped);
  };
  const setVegSafe = (n: number) => {
    setVegCount(Math.min(count, Math.max(0, isFinite(n) ? Math.floor(n) : 0)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !company.trim() || !date) { toast.error("Please fill required fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false); setDone(true);
  };

  if (done) return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--emerald)]/10"><CheckCircle2 className="h-12 w-12 text-[var(--emerald)]" /></div>
        <h1 className="mt-6 font-serif text-4xl italic">Enquiry received</h1>
        <p className="mt-3 text-muted-foreground">Our banquet coordinator will call you within a few hours on {phone} to confirm your booking for {count} guests on {date}.</p>
        <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]"><Phone className="h-4 w-4" /> Call directly</a>
      </div>
      <SiteFooter />
    </div>
  );

  return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <section className="royal-page-hero relative isolate overflow-hidden text-[var(--ivory)]">
        <img src={teamDinner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--emerald)]/80 to-[var(--emerald-deep)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="eyebrow text-[var(--brass)]"><span className="ornament">For teams · For companies</span></p>
          <h1 className="mt-4 font-serif text-5xl italic md:text-7xl">The corporate table</h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--ivory)]/80">From 8-person team lunches to 80-person off-sites. Set menus, reserved halls, dedicated coordinator — Ratna Deluxe has hosted Kushaiguda's IT parks for two decades.</p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Feature icon={Users} title="Groups of 8 – 80" text="Reserved sections, private halls or the full A/C deluxe floor." />
            <Feature icon={Utensils} title="Curated set menus" text="Fixed price per head. Veg / mixed / executive options." />
            <Feature icon={Presentation} title="AV & projector" text="Available on request for internal presentations & offsites." />
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 md:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl">Pick a package</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <button type="button" key={p.id} onClick={() => setPkg(p.id)} className={`text-left rounded-sm border-2 bg-white p-5 transition ${pkg === p.id ? "border-[var(--emerald)] shadow-lg" : "border-[var(--brass)]/25 hover:border-[var(--emerald)]/50"}`}>
                {p.popular && <span className="mb-2 inline-block rounded-full bg-[var(--brass)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">Most booked</span>}
                <h3 className="font-serif text-xl">{p.name}</h3>
                <p className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">₹{p.price}<span className="ml-1 text-xs font-sans not-italic text-muted-foreground">/ head</span></p>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {p.includes.map((i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1 w-2 shrink-0 bg-[var(--brass)]" /> {i}</li>)}
                </ul>
                <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Minimum {p.min} guests</p>
              </button>
            ))}
          </div>

          <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
            <h3 className="font-serif text-2xl">Your details</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <F label="Company name *"><input required value={company} onChange={(e) => setCompany(e.target.value)} className={inp} /></F>
              <F label="Contact person *"><input required value={name} onChange={(e) => setName(e.target.value)} className={inp} /></F>
              <F label="Phone *"><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} /></F>
              <F label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} /></F>
              <F label="Preferred date *"><input required type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className={inp} /></F>
              <F label="Number of guests">
                <div className="flex items-center gap-2 rounded-sm border border-border bg-white p-1">
                  <button type="button" onClick={() => setCountSafe(count - 5)} className="h-9 w-9 hover:bg-secondary">−</button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={selected.min}
                    max={200}
                    value={count}
                    onChange={(e) => setCountSafe(Number(e.target.value))}
                    className="flex-1 text-center font-bold bg-transparent outline-none"
                  />
                  <button type="button" onClick={() => setCountSafe(count + 5)} className="h-9 w-9 hover:bg-secondary">+</button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">Type or tap · min {selected.min}, max 200</p>
              </F>
            </div>
            <div className="mt-4 rounded-sm border border-[var(--brass)]/25 bg-[var(--brass)]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Veg / Non-Veg split</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Helps us portion starters and mains correctly.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">🟢 Veg guests</span>
                  <div className="flex items-center gap-2 rounded-sm border border-border bg-white p-1">
                    <button type="button" onClick={() => setVegSafe(vegCount - 1)} className="h-9 w-9 hover:bg-secondary">−</button>
                    <input type="number" inputMode="numeric" min={0} max={count} value={vegCount}
                      onChange={(e) => setVegSafe(Number(e.target.value))}
                      className="flex-1 text-center font-bold bg-transparent outline-none" />
                    <button type="button" onClick={() => setVegSafe(vegCount + 1)} className="h-9 w-9 hover:bg-secondary">+</button>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">🔴 Non-Veg guests</span>
                  <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary/40 p-1">
                    <span className="flex-1 text-center font-bold text-[var(--emerald-deep)]">{nonVegCount}</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-muted-foreground">Auto-calculated ({count} − veg)</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <F label="Anything else? (AV, dietary needs, timing…)">
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} className={inp + " resize-none"} />
              </F>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
            <p className="eyebrow text-muted-foreground">Estimate</p>
            <p className="mt-2 font-serif text-lg">{selected.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{count} guests × ₹{selected.price}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Split: {vegCount} veg · {nonVegCount} non-veg</p>
            <div className="my-4 brass-rule" />
            <div className="flex justify-between font-serif text-3xl italic"><span>Approx.</span><span className="text-[var(--emerald-deep)]">₹{estimate.toLocaleString()}</span></div>
            <p className="mt-2 text-[11px] text-muted-foreground">Final quote confirmed by the coordinator. Taxes extra. Décor & AV chargeable.</p>
            <button disabled={busy} className="mt-5 w-full rounded-full bg-[var(--emerald-deep)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)] disabled:opacity-60">
              {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Send enquiry"}
            </button>
            <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="mt-3 block text-center text-xs font-bold uppercase tracking-widest text-[var(--emerald-deep)] underline decoration-[var(--brass)] underline-offset-4">Or call {RESTAURANT.phoneShort}</a>
          </div>
        </aside>
      </form>
      <SiteFooter />
    </div>
  );
}

const inp = "w-full rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]";
function F({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>{children}</label>;
}
function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
      <Icon className="h-6 w-6 text-[var(--brass)]" />
      <h3 className="mt-3 font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
