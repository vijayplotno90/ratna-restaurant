import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Leaf, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { menuItems, categories, dishUrl, LOCATIONS, priceAt, getLocation, type MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [
    { title: "Menu — Ratna Deluxe" },
    { name: "description", content: "Full menu of Ratna Deluxe, Kushaiguda — biryani, tandoori, curries, Indo-Chinese, breads, desserts and drinks. Veg & non-veg." },
  ] }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState("popular");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [detail, setDetail] = useState<MenuItem | null>(null);
  const [locId, setLocId] = useState<"ratna" | "deluxe">("ratna");
  const location = getLocation(locId);

  const filtered = useMemo(() => {
    let list = search.trim()
      ? menuItems.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
      : active === "popular"
        ? menuItems.filter((m) => m.popular || m.chefPick)
        : menuItems.filter((m) => m.category === active);
    if (vegOnly) list = list.filter((m) => m.veg);
    return list;
  }, [active, search, vegOnly]);

  const current = categories.find((c) => c.id === active);

  return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <header className="royal-page-hero px-6 py-14 text-[var(--ivory)] md:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="eyebrow text-[var(--brass)]"><span className="ornament">Established 2004</span></p>
          <h1 className="mt-4 font-serif text-5xl italic md:text-7xl">Our Menu</h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--ivory)]/75">120+ dishes across biryani, tandoori, curries, Indo-Chinese, breads, sweets. Prices in ₹, taxes extra.</p>

          {/* Location switcher */}
          <div className="mx-auto mt-8 inline-flex overflow-hidden rounded-full border border-[var(--brass)]/40 bg-black/25 p-1">
            {LOCATIONS.map((l) => (
              <button key={l.id} onClick={() => setLocId(l.id)}
                className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${locId === l.id ? "bg-[var(--brass)] text-[var(--emerald-deep)]" : "text-[var(--ivory)]/75 hover:text-[var(--ivory)]"}`}>
                {l.name}{l.ac ? " · A/C" : ""}
              </button>
            ))}
          </div>
          <p className="mx-auto mt-3 max-w-md text-[11px] text-[var(--ivory)]/65">
            {location.tagline}{location.priceMultiplier > 1 && ` · +${Math.round((location.priceMultiplier - 1) * 100)}% A/C service on menu prices`}
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes…" className="w-full rounded-full bg-white py-3.5 pl-11 pr-4 text-sm text-foreground outline-none ring-2 ring-transparent focus:ring-[var(--brass)]" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--ivory)]/10 px-5 py-3 text-xs font-bold uppercase tracking-widest ring-1 ring-[var(--brass)]/30">
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="h-4 w-4 accent-green-500" />
              <Leaf className="h-3.5 w-3.5" /> Veg only
            </label>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 md:px-8">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-28">
            <p className="eyebrow mb-4 text-muted-foreground">Sections</p>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => { setSearch(""); setActive(c.id); }}
                    className={`w-full rounded-sm border-l-2 px-3 py-2.5 text-left text-sm transition ${
                      active === c.id && !search ? "border-[var(--brass)] bg-white font-semibold text-[var(--emerald-deep)]" : "border-transparent hover:border-[var(--brass)]/40 hover:bg-white/60"
                    }`}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="sticky top-[104px] z-30 -mx-4 mb-4 flex gap-2 overflow-x-auto border-b border-border bg-[var(--ivory)]/95 px-4 py-3 no-scrollbar backdrop-blur md:hidden">
          {categories.map((c) => (
            <button key={c.id} onClick={() => { setSearch(""); setActive(c.id); }} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${active === c.id && !search ? "bg-[var(--emerald-deep)] text-[var(--ivory)]" : "bg-white text-foreground"}`}>
              {c.title}
            </button>
          ))}
        </div>

        <main className="flex-1">
          <div className="mb-6">
            <h2 className="font-serif text-3xl md:text-4xl">{search ? `Results for "${search}"` : current?.title}</h2>
            {!search && current && <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>}
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No dishes found. Try clearing filters.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((m) => <DishRow key={m.id} item={m} locId={locId} onView={() => setDetail(m)} />)}
            </div>
          )}
        </main>
      </div>

      {detail && <DishSheet item={detail} locId={locId} onClose={() => setDetail(null)} />}
      <SiteFooter />
    </div>
  );
}

function DishRow({ item, locId, onView }: { item: MenuItem; locId: "ratna" | "deluxe"; onView: () => void }) {
  const { add } = useCart();
  const price = priceAt(item.price, locId);
  return (
    <article className="group flex overflow-hidden rounded-sm border border-[var(--brass)]/20 bg-white transition hover:shadow-md">
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-block h-3.5 w-3.5 rounded-sm border-2 ${item.veg ? "border-green-600" : "border-red-600"} bg-white p-px`}>
            <span className={`block h-full w-full rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
          </span>
          {item.chefPick && <span className="rounded-full bg-[var(--brass)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">Chef's Pick</span>}
          {item.popular && !item.chefPick && <span className="rounded-full bg-[var(--emerald)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">Popular</span>}
          {item.spicy && <span className="text-[10px]">{"🌶".repeat(item.spicy)}</span>}
        </div>
        <Link to="/dish/$id" params={{ id: item.id }}>
          <h3 className="mt-2 font-serif text-xl leading-tight hover:text-[var(--emerald)]">{item.name}</h3>
        </Link>
        {item.description && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
        <p className="mt-3 font-serif text-lg italic text-[var(--emerald-deep)]">
          ₹{price}
          {price !== item.price && <span className="ml-2 text-[11px] not-italic text-muted-foreground line-through">₹{item.price}</span>}
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={onView} className="text-[11px] font-semibold uppercase tracking-widest text-[var(--emerald-deep)] underline decoration-[var(--brass)] underline-offset-4">Details</button>
          <button onClick={() => { add({ itemId: item.id, name: item.name, image: item.image, unitPrice: price }); toast.success(`${item.name} added`); }}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
      <Link to="/dish/$id" params={{ id: item.id }} className="relative aspect-square w-32 shrink-0 overflow-hidden md:w-40">
        <img src={dishUrl(item.image)} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
    </article>
  );
}

function DishSheet({ item, locId, onClose }: { item: MenuItem; locId: "ratna" | "deluxe"; onClose: () => void }) {
  const { add } = useCart();
  const price = priceAt(item.price, locId);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white md:rounded-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[16/10]">
          <img src={dishUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
          <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-foreground shadow"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">
          <h2 className="font-serif text-3xl">{item.name}</h2>
          <p className="mt-1 font-serif text-xl italic text-[var(--emerald-deep)]">
            ₹{price}
            {price !== item.price && <span className="ml-2 text-xs not-italic text-muted-foreground">Ratna price ₹{item.price}</span>}
          </p>
          {item.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
          <button onClick={() => { add({ itemId: item.id, name: item.name, image: item.image, unitPrice: price }); toast.success(`${item.name} added`); onClose(); }}
            className="mt-6 w-full rounded-full bg-[var(--emerald-deep)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">
            Add to order — ₹{price}
          </button>
        </div>
      </div>
    </div>
  );
}
