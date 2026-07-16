import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, Phone, Car, Utensils, Snowflake, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { RESTAURANT, LOCATIONS } from "@/data/menu";
import { pushEnquiry } from "@/lib/admin-store";

export const Route = createFileRoute("/visit")({
  head: () => ({ meta: [
    { title: "Visit — Ratna & Ratna Deluxe, Kushaiguda" },
    { name: "description", content: "Ratna and Ratna Deluxe share one address at Chakripuram Cross Roads, Kushaiguda. Open 12 PM – 11:30 PM, all seven days. Valet parking, A/C hall, family sections." },
  ] }),
  component: VisitPage,
});

function VisitPage() {
  return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <header className="royal-page-hero px-6 py-16 text-center text-[var(--ivory)]">
        <p className="eyebrow text-[var(--brass)]"><span className="ornament">Come dine with us</span></p>
        <h1 className="mt-4 font-serif text-5xl italic md:text-7xl">Visit Us</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--ivory)]/80">One address, two dining halls, two decades. Open every day, from noon until late.</p>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        {/* Two halls */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {LOCATIONS.map((l) => (
            <div key={l.id} className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl italic text-[var(--emerald-deep)]">{l.name}</h3>
                {l.ac && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]"><Snowflake className="h-3 w-3" /> Full A/C</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{l.tagline}</p>
              <p className="mt-3 text-sm text-muted-foreground">{l.description}</p>
              <p className="mt-4 text-[11px] uppercase tracking-widest font-bold text-[var(--brass)]">{l.seats} seats · {l.priceMultiplier > 1 ? `+${Math.round((l.priceMultiplier - 1) * 100)}% A/C service` : "Base menu pricing"}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-8">
            <h2 className="font-serif text-3xl">Address</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{RESTAURANT.address}</p>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--brass)]" /> {RESTAURANT.area}</p>
              <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-[var(--brass)]" /> {RESTAURANT.hours}</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[var(--brass)]" /> <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="hover:text-[var(--emerald)]">{RESTAURANT.phoneShort}</a></p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT.map} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">Get directions <ExternalLink className="h-4 w-4" /></a>
              <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald-deep)]/30 px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)]"><Phone className="h-4 w-4" /> Call</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Amenity icon={Snowflake} title="Deluxe A/C hall" text="120 seats, ambient lighting." />
            <Amenity icon={Utensils} title="Ratna hall" text="60 seats, walk-in friendly." />
            <Amenity icon={Car} title="Valet parking" text="Bike & car parking on-site." />
            <Amenity icon={Clock} title="Open all week" text="12 PM – 11:30 PM." />
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-sm border border-[var(--brass)]/25 bg-white">
          <iframe
            title="Map to Ratna Deluxe"
            src={`https://maps.google.com/maps?q=${encodeURIComponent("Ratna Restaurant Chakripuram Kushaiguda Hyderabad")}&output=embed`}
            className="h-[380px] w-full"
            loading="lazy"
          />
        </div>
        <EnquiryForm />
      </section>
      <SiteFooter />
    </div>
  );
}

function Amenity({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5">
      <Icon className="h-5 w-5 text-[var(--brass)]" />
      <h3 className="mt-3 font-serif text-lg">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function EnquiryForm() {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) { toast.error("Please fill all fields"); return; }
    pushEnquiry({ name: name.trim(), phone: phone.trim(), message: message.trim() });
    setSent(true); setName(""); setPhone(""); setMessage("");
    toast.success("Thanks! We'll get back to you soon.");
  };
  return (
    <div className="mt-10 rounded-sm border border-[var(--brass)]/25 bg-white p-8">
      <p className="eyebrow text-[var(--emerald)]">Send us a message</p>
      <h2 className="mt-2 font-serif text-3xl italic">Have a question?</h2>
      <p className="mt-2 text-sm text-muted-foreground">Group bookings, allergies, custom platters, catering enquiries — drop us a note and our manager will call you back.</p>
      {sent && <p className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[var(--emerald)]/10 px-3 py-2 text-sm text-[var(--emerald-deep)]"><CheckCircle2 className="h-4 w-4" /> Message received.</p>}
      <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone (+91 …)" className="rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))} rows={4} placeholder="How can we help?" className="md:col-span-2 rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)] resize-none" />
        <button className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--emerald-deep)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]"><Send className="h-3.5 w-3.5" /> Send message</button>
      </form>
    </div>
  );
}
