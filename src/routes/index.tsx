import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Star, MapPin, Clock, Phone, Users, Utensils, Award, Flame, Sparkles, Quote, Snowflake, Check } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { menuItems, RESTAURANT, dishUrl, categories, LOCATIONS } from "@/data/menu";
import { HomepageSpecial, useHomepageSpecials } from "@/lib/admin-store";
import heroInterior from "@/assets/hero-interior.jpg";
import teamDinner from "@/assets/team-dinner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ratna & Ratna Deluxe — Multi-Cuisine Restaurant, Kushaiguda" },
      { name: "description", content: "Since 2004 — Hyderabadi dum biryani, tandoori, Indo-Chinese and sweets. Two dining halls: Ratna (walk-in) and Ratna Deluxe (full A/C). Reservations & team lunches at Chakripuram, Kushaiguda." },
      { property: "og:image", content: heroInterior },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const chefPicks = menuItems.filter((m) => m.chefPick).slice(0, 6);
  const legacy = chefPicks.slice(0, 4);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[var(--emerald)] text-[var(--ivory)] grain">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--emerald)] via-[var(--emerald)] to-[var(--emerald-deep)]" />
        <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div className="text-center lg:text-left">
          <p className="eyebrow text-[var(--brass)]"><span className="ornament">Kushaiguda · Hyderabad</span></p>
          <h1 className="mt-6 font-serif text-6xl leading-[0.95] md:text-8xl lg:text-9xl">
            <span className="italic">Ratna</span> <span className="text-[var(--brass)]">&amp;</span> <span className="italic">Deluxe</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-24 bg-[var(--brass)] lg:mx-0" />
          <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic text-[var(--ivory)]/85 md:text-2xl lg:mx-0">
            Twenty years of Hyderabadi hospitality — two dining rooms, one legendary kitchen. Biryani from the copper handi, kebabs from live charcoal, sweets from the old city.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link to="/reserve" className="inline-flex items-center gap-2 rounded-full bg-[var(--brass)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)] shadow-lg transition hover:brightness-95">
              Reserve a Table <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/menu" className="inline-flex items-center gap-2 rounded-full border border-[var(--brass)]/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--ivory)]/10">
              Explore the Menu
            </Link>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.25em] text-[var(--ivory)]/70 lg:justify-start">
            <span className="inline-flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" /> {RESTAURANT.rating} · {RESTAURANT.reviews.toLocaleString()} ratings</span>
            <span className="inline-flex items-center gap-2"><Award className="h-3.5 w-3.5 text-[var(--brass)]" /> {new Date().getFullYear() - RESTAURANT.established} years in business</span>
            <span className="inline-flex items-center gap-2"><Users className="h-3.5 w-3.5 text-[var(--brass)]" /> Seats {RESTAURANT.seats}+</span>
          </div>
          </div>
          <HeroPromotion />
        </div>

        <div className="relative border-t border-[var(--brass)]/30 bg-[var(--emerald-deep)]/40 py-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--ivory)]/75">
          <div className="flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-16 px-8 whitespace-nowrap">
              {[..."Dum Biryani · Tandoori · Indo-Chinese · Curries · Kebabs · Sweets · Fresh Juices · Family Halls · Valet Parking · A/C Deluxe".split(" · "), ..."Dum Biryani · Tandoori · Indo-Chinese · Curries · Kebabs · Sweets · Fresh Juices · Family Halls · Valet Parking · A/C Deluxe".split(" · ")].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-3"><span className="h-1 w-1 rounded-full bg-[var(--brass)]" />{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHEF'S PICKS — surfaced first so guests see the food immediately */}
      <section className="bg-white px-6 py-20 text-foreground md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="eyebrow text-[var(--emerald)]"><span className="ornament">From our kitchen</span></p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Chef's Selection</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">The plates our regulars come back for, and the ones our chef would order himself.</p>
          </div>
          <div className="mt-12 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
            {chefPicks.map((d) => (
              <Link key={d.id} to="/dish/$id" params={{ id: d.id }} className="group relative block w-[280px] shrink-0 snap-start overflow-hidden rounded-sm border border-[var(--brass)]/40 bg-white shadow-sm transition hover:border-[var(--emerald)] hover:shadow-lg">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={dishUrl(d.image)} alt={d.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <VegDot veg={d.veg} />
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-white">{d.name}</h3>
                    {d.description && <p className="mt-2 line-clamp-2 text-sm text-white/80">{d.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-serif text-xl italic text-[var(--brass)]">₹{d.price}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">View →</span>
                    </div>
                  </div>
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--brass)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--emerald-deep)]">
                    <Sparkles className="h-3 w-3" /> Chef's Pick
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] shadow-sm transition hover:bg-[var(--emerald-deep)]">
              Browse all 120+ dishes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="border-b border-[var(--brass)]/20 bg-[var(--ivory)] px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="eyebrow text-[var(--emerald)]">Est. 2004</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">A Hyderabadi table with room for everyone.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Ratna Deluxe has been the neighbourhood's dependable dinner spot for two decades. Families, colleagues, celebrations — we host all of them, seven days a week, from noon until late.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our biryani rice is aged basmati, slow-cooked in a sealed copper handi. Our tandoor runs on live charcoal from dusk. And there is always something for the vegetarian at the table.
            </p>
            <Link to="/menu" className="mt-8 inline-flex items-center gap-2 font-serif text-lg italic text-[var(--emerald)] underline decoration-[var(--brass)] decoration-2 underline-offset-4 hover:text-[var(--emerald-deep)]">
              See the full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat n={`${new Date().getFullYear() - RESTAURANT.established}+`} label="Years serving" />
            <Stat n={`${(RESTAURANT.reviews / 1000).toFixed(1)}k`} label="Ratings" />
            <Stat n={`${RESTAURANT.seats}+`} label="Seats" />
            <Stat n="120+" label="Dishes" />
            <Stat n="7" label="Days a week" />
            <Stat n="A/C" label="Deluxe hall" />
          </div>
        </div>
      </section>

      {/* TWO RATNAS */}
      <section className="border-b border-[var(--brass)]/20 bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow text-[var(--emerald)]"><span className="ornament">Two rooms, one kitchen</span></p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Choose your Ratna</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Same recipes, same chefs, same 20-year-old kitchen. Pick the room that suits your evening.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <LegacyShowcase dishes={legacy} />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7 lg:grid-cols-1">
            {LOCATIONS.map((l) => (
              <div key={l.id} className={`relative flex flex-col rounded-sm border-2 p-8 ${l.ac ? "border-[var(--emerald-deep)] bg-[var(--ivory)]" : "border-[var(--brass)]/40 bg-white"}`}>
                {l.ac && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--ivory)]"><Snowflake className="h-3 w-3" /> Full A/C · Premium</span>}
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-4xl italic text-[var(--emerald)]">{l.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--brass)]">{l.seats} seats</span>
                </div>
                <p className="mt-2 font-serif text-lg italic text-muted-foreground">{l.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{l.description}</p>
                <ul className="mt-5 space-y-2">
                  {l.bestFor.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-[var(--emerald)]" /> {b}</li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 border-t border-[var(--brass)]/20 pt-4 text-[11px] uppercase tracking-widest text-[var(--brass)] font-bold">
                  {l.priceMultiplier > 1 ? `+${Math.round((l.priceMultiplier - 1) * 100)}% A/C service on menu prices` : "Base menu pricing · no service charge"}
                </div>
                <Link to="/reserve" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--emerald)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald-deep)]">
                  Reserve at {l.name} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-[var(--ivory)] px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="eyebrow text-[var(--emerald)]"><span className="ornament">The menu</span></p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">A cuisine for every craving</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.filter((c) => c.id !== "popular").slice(0, 8).map((c) => (
              <Link key={c.id} to="/menu" hash={c.id} className="group rounded-sm border border-[var(--brass)]/30 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--emerald)] hover:shadow-lg">
                <Utensils className="h-5 w-5 text-[var(--brass)]" />
                <h3 className="mt-4 font-serif text-xl">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CORPORATE / TEAM LUNCH BANNER */}
      <section className="bg-white px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="eyebrow text-[var(--emerald)]">Corporate & team lunches</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">Book the room. We'll handle the rest.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              A/C deluxe hall for up to 120. Set menus for teams of 8 to 80. Silent takeaway packs for the office. Ratna Deluxe has been the go-to for company off-sites, team lunches and family functions in Kushaiguda for two decades.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {["Curated 3-course & thali set menus from ₹399/head", "Reserved sections, projector & AV on request", "Silent bulk-order packs for office deliveries", "Dedicated coordinator for groups of 20+"].map((s) => (
                <li key={s} className="flex items-start gap-2"><span className="mt-1.5 h-1 w-3 shrink-0 bg-[var(--brass)]" /> {s}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/corporate" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald-deep)]">
                Plan a team lunch
              </Link>
              <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald)]/30 px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)] hover:bg-secondary">
                <Phone className="h-4 w-4" /> Call the manager
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-[var(--brass)]/25">
              <img src={teamDinner} alt="Corporate dinner at Ratna Deluxe" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white px-6 py-20 text-foreground md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow text-[var(--emerald)]"><span className="ornament">Voices from the table</span></p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">{RESTAURANT.rating} stars · {RESTAURANT.reviews.toLocaleString()} ratings</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Rajesh K.", role: "Kushaiguda local", quote: "The mutton biryani here has been my go-to since college. Two decades, still the same taste." },
              { name: "Priya M.", role: "Team lunch, TCS", quote: "Booked the hall for 40. Everything was set. Even the vegetarians came back for seconds." },
              { name: "Ahmed S.", role: "Family diner", quote: "Chicken 65 and paneer majestic — order both. Trust me. Also the double ka meetha." },
            ].map((t, i) => (
              <figure key={i} className="rounded-sm border border-[var(--brass)]/30 bg-[var(--ivory)] p-8">
                <Quote className="h-6 w-6 text-[var(--emerald)]" />
                <blockquote className="mt-4 font-serif text-lg italic leading-relaxed text-foreground/90">"{t.quote}"</blockquote>
                <figcaption className="mt-6 border-t border-[var(--brass)]/20 pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-[var(--emerald)]">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="bg-[var(--ivory)] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow text-[var(--emerald)]">Visit us</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">One address. Two decades.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">{RESTAURANT.address}</p>
            <div className="mt-8 space-y-3 text-sm">
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--brass)]" /> {RESTAURANT.area}</p>
              <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-[var(--brass)]" /> {RESTAURANT.hours}</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[var(--brass)]" /> <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="hover:text-[var(--emerald)]">{RESTAURANT.phoneShort}</a></p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT.map} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald-deep)]">Get directions</a>
              <Link to="/reserve" className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald)]/30 px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)] hover:bg-secondary">Reserve a table</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FeatureTile icon={Flame} title="Live tandoor" text="Fired on charcoal from dusk to close." />
            <FeatureTile icon={Users} title="Family halls" text="A/C deluxe seating for 120." />
            <FeatureTile icon={Utensils} title="Veg & non-veg" text="Fully separated kitchens." />
            <FeatureTile icon={Award} title="Valet parking" text="Bike & car parking on premises." />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function HeroPromotion() {
  const { list, hydrated } = useHomepageSpecials();
  const [active, setActive] = useState(0);
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const enabled = list.filter((item) => item.enabled);
  // One clear decision tree: a live festival replaces everything; otherwise
  // show only today's weekday offer. A signature dish is a fallback only.
  const festivals = enabled.filter((item) => item.startDate && item.startDate <= today && (item.endDate || item.startDate) >= today);
  const weekdayOffers = enabled.filter((item) => !item.startDate && item.weekdays?.includes(now.getDay()));
  const fallback = enabled.filter((item) => !item.startDate && !item.weekdays?.length && item.kind === "signature");
  const live = festivals.length ? festivals : weekdayOffers.length ? weekdayOffers : fallback;
  const shown = active % Math.max(live.length, 1);
  useEffect(() => { if (live.length < 2) return; const timer = window.setInterval(() => setActive((value) => (value + 1) % live.length), 5500); return () => window.clearInterval(timer); }, [live.length]);
  if (!hydrated || !live.length) return null;
  return <div className="relative min-h-[390px] w-full overflow-hidden rounded-sm border border-[var(--brass)]/60 bg-[var(--emerald-deep)] shadow-2xl md:min-h-[500px]">
    {live.map((item, index) => <a key={item.id} href={item.link} aria-hidden={index !== shown} className={`absolute inset-0 transition-opacity duration-700 ${index === shown ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <img src={dishUrl(item.image)} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--emerald-deep)] via-[var(--emerald-deep)]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brass)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--emerald-deep)]"><Sparkles className="h-3 w-3" /> {item.eyebrow}</span>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-[var(--ivory)] md:text-5xl">{item.title}</h2>
        <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-[var(--ivory)]/85 md:text-base">{item.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--brass)]">Explore now <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </a>)}
    <div className="absolute right-4 top-4 z-10 flex gap-1.5">{live.map((item, index) => <button key={item.id} onClick={() => setActive(index)} aria-label={`Show ${item.title}`} className={`h-1.5 rounded-full transition-all ${index === shown ? "w-6 bg-[var(--brass)]" : "w-1.5 bg-white/55"}`} />)}</div>
  </div>;
}

function HomepagePromotions() {
  const { list, hydrated } = useHomepageSpecials();
  const [active, setActive] = useState(0);
  const today = new Date();
  const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
  const weekday = today.getDay();
  const live = list
    .filter((item) => item.enabled)
    .filter((item) => !item.startDate || (item.startDate <= todayKey && (item.endDate || item.startDate) >= todayKey))
    .sort((a, b) => specialPriority(b, weekday) - specialPriority(a, weekday));
  const shown = active % Math.max(live.length, 1);

  useEffect(() => setActive(0), [todayKey, live.length]);
  useEffect(() => {
    if (live.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % live.length), 5500);
    return () => window.clearInterval(timer);
  }, [live.length]);

  if (!hydrated || !live.length) return null;
  return (
    <section className="bg-[var(--ivory)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-[var(--emerald)]"><span className="ornament">Today at Ratna</span></p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Something special is always on the table.</h2>
          </div>
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--emerald)] underline decoration-[var(--brass)] decoration-2 underline-offset-4">See all dishes <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative min-h-[390px] overflow-hidden rounded-sm border border-[var(--brass)]/45 bg-[var(--emerald-deep)] shadow-lg md:min-h-[420px]">
          {live.map((item, index) => (
            <a key={item.id} href={item.link} aria-hidden={index !== shown} className={`absolute inset-0 transition-opacity duration-700 ${index === shown ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <img src={dishUrl(item.image)} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--emerald-deep)] via-[var(--emerald-deep)]/80 to-[var(--emerald-deep)]/15" />
              <div className="absolute inset-0 flex max-w-2xl flex-col justify-center p-7 text-[var(--ivory)] md:p-12">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--brass)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--emerald-deep)]"><Sparkles className="h-3.5 w-3.5" /> {item.eyebrow}</span>
                <h3 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">{item.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ivory)]/85 md:text-lg">{item.description}</p>
                <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brass)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--emerald-deep)]">Explore now <ArrowRight className="h-4 w-4" /></span>
              </div>
            </a>
          ))}
          <div className="absolute bottom-5 right-6 z-10 flex gap-2">
            {live.map((item, index) => <button key={item.id} onClick={() => setActive(index)} aria-label={`Show ${item.title}`} className={`h-2 rounded-full transition-all ${index === shown ? "w-8 bg-[var(--brass)]" : "w-2 bg-white/50"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function specialPriority(item: HomepageSpecial, weekday: number) {
  if (item.startDate) return 30;
  if (item.weekdays?.includes(weekday)) return 20;
  if (item.kind === "signature") return 10;
  return 5;
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5 text-center">
      <p className="font-serif text-3xl italic text-[var(--emerald)]">{n}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
    </div>
  );
}
function VegDot({ veg, className = "" }: { veg: boolean; className?: string }) {
  return (
    <span className={`inline-block h-4 w-4 rounded-sm border-2 ${veg ? "border-green-600" : "border-red-600"} bg-white p-px ${className}`}>
      <span className={`block h-full w-full rounded-full ${veg ? "bg-green-600" : "bg-red-600"}`} />
    </span>
  );
}
function FeatureTile({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5">
      <Icon className="h-5 w-5 text-[var(--brass)]" />
      <h4 className="mt-3 font-serif text-lg">{title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

type LegacyDish = { id: string; name: string; description?: string; image: string; price: number };
function LegacyShowcase({ dishes }: { dishes: LegacyDish[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (dishes.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % dishes.length), 3000);
    return () => clearInterval(t);
  }, [dishes.length]);
  if (!dishes.length) return null;
  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-sm border-2 border-[var(--brass)]/40 bg-[var(--emerald)]">
      <span className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-[var(--brass)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--emerald-deep)]">
        <Sparkles className="h-3 w-3" /> Signature since 2004
      </span>
      {dishes.map((d, idx) => (
        <Link
          key={d.id}
          to="/dish/$id"
          params={{ id: d.id }}
          className={`absolute inset-0 block transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <img src={dishUrl(d.image)} alt={d.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--emerald-deep)]/90 via-[var(--emerald)]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-[var(--ivory)]">
            <p className="eyebrow text-[var(--brass)]">The Legacy Plate</p>
            <h3 className="mt-2 font-serif text-3xl italic leading-tight md:text-4xl">{d.name}</h3>
            {d.description && <p className="mt-2 line-clamp-2 max-w-md text-sm text-[var(--ivory)]/80">{d.description}</p>}
            <div className="mt-4 flex items-center justify-between">
              <span className="font-serif text-xl italic text-[var(--brass)]">₹{d.price}</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--ivory)]/70">View dish →</span>
            </div>
          </div>
        </Link>
      ))}
      <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
        {dishes.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.preventDefault(); setI(idx); }}
            aria-label={`Show dish ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-[var(--brass)]" : "w-1.5 bg-[var(--ivory)]/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
