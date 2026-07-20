import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Leaf, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import {
  menuItems,
  categories,
  dishUrl,
  LOCATIONS,
  priceAt,
  getLocation,
  nutritionFor,
  type MenuItem,
} from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useOverrides } from "@/lib/admin-store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Ratna Deluxe" },
      {
        name: "description",
        content:
          "Full menu of Ratna Deluxe, Kushaiguda — biryani, tandoori, curries, Indo-Chinese, breads, desserts and drinks. Veg & non-veg.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState("popular");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [detail, setDetail] = useState<MenuItem | null>(null);
  const [locId, setLocId] = useState<"ratna" | "deluxe">("ratna");
  const location = getLocation(locId);
  const availability = useOverrides();

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
      <header className="royal-page-hero px-4 py-10 text-[var(--ivory)] sm:px-6 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl text-center">
          <p className="eyebrow text-[var(--brass)]">
            <span className="ornament">Established 2004</span>
          </p>
          <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl md:text-6xl lg:text-7xl">Our Menu</h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--ivory)]/75">
            120+ dishes across biryani, tandoori, curries, Indo-Chinese, breads, sweets. Prices in
            ₹, taxes extra.
          </p>

          {/* Location switcher */}
          <div className="mx-auto mt-8 max-w-full overflow-x-auto rounded-full border border-[var(--brass)]/40 bg-black/25 p-1 no-scrollbar">
            <div className="inline-flex min-w-max">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLocId(l.id)}
                className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${locId === l.id ? "bg-[var(--brass)] text-[var(--emerald-deep)]" : "text-[var(--ivory)]/75 hover:text-[var(--ivory)]"}`}
              >
                {l.name}
                {l.ac ? " · A/C" : ""}
              </button>
            ))}
            </div>
          </div>
          <p className="mx-auto mt-3 max-w-md text-[11px] text-[var(--ivory)]/65">
            {location.tagline}
            {location.priceMultiplier > 1 &&
              ` · +${Math.round((location.priceMultiplier - 1) * 100)}% A/C service on menu prices`}
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
                className="w-full rounded-full bg-white py-3.5 pl-11 pr-4 text-sm text-foreground outline-none ring-2 ring-transparent focus:ring-[var(--brass)]"
              />
            </div>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--ivory)]/10 px-5 py-3 text-xs font-bold uppercase tracking-widest ring-1 ring-[var(--brass)]/30 sm:w-auto">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="h-4 w-4 accent-green-500"
              />
              <Leaf className="h-3.5 w-3.5" /> Veg only
            </label>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:py-10 lg:flex-row lg:gap-8 lg:px-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-28">
            <p className="eyebrow mb-4 text-muted-foreground">Sections</p>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSearch("");
                      setActive(c.id);
                    }}
                    className={`w-full rounded-sm border-l-2 px-3 py-2.5 text-left text-sm transition ${
                      active === c.id && !search
                        ? "border-[var(--brass)] bg-white font-semibold text-[var(--emerald-deep)]"
                        : "border-transparent hover:border-[var(--brass)]/40 hover:bg-white/60"
                    }`}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="sticky top-[104px] z-30 -mx-4 mb-4 flex gap-2 overflow-x-auto border-b border-border bg-[var(--ivory)]/95 px-4 py-3 no-scrollbar backdrop-blur lg:hidden sm:-mx-6 sm:px-6">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearch("");
                setActive(c.id);
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${active === c.id && !search ? "bg-[var(--emerald-deep)] text-[var(--ivory)]" : "bg-white text-foreground"}`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <main className="flex-1">
          <div className="mb-6">
            <h2 className="font-serif text-3xl md:text-4xl">
              {search ? `Results for "${search}"` : current?.title}
            </h2>
            {!search && current && (
              <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No dishes found. Try clearing filters.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filtered.map((m) => (
                <DishRow key={m.id} item={m} locId={locId} available={availability.map[m.id]?.available !== false} onView={() => setDetail(m)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {detail && <DishSheet item={detail} locId={locId} onClose={() => setDetail(null)} />}
      <SiteFooter />
    </div>
  );
}

function DishRow({
  item,
  locId,
  available,
  onView,
}: {
  item: MenuItem;
  locId: "ratna" | "deluxe";
  available: boolean;
  onView: () => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(item.variants?.[0]?.id ?? "");
  const variant = item.variants?.find((option) => option.id === variantId);
  const price = priceAt(variant?.price ?? item.price, locId);
  return (
    <article className={`group flex flex-col-reverse overflow-hidden rounded-sm border border-[var(--brass)]/20 bg-white transition xl:flex-row ${available ? "hover:shadow-md" : "opacity-60 grayscale"}`}>
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block h-3.5 w-3.5 rounded-sm border-2 ${item.veg ? "border-green-600" : "border-red-600"} bg-white p-px`}
          >
            <span
              className={`block h-full w-full rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`}
            />
          </span>
          {item.chefPick && (
            <span className="rounded-full bg-[var(--brass)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">
              Chef's Pick
            </span>
          )}
          {item.popular && !item.chefPick && (
            <span className="rounded-full bg-[var(--emerald)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">
              Popular
            </span>
          )}
          {item.spicy && <span className="text-[10px]">{"🌶".repeat(item.spicy)}</span>}
        </div>
        <Link to="/dish/$id" params={{ id: item.id }}>
          <h3 className="mt-2 font-serif text-xl leading-tight hover:text-[var(--emerald)]">
            {item.name}
          </h3>
        </Link>
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="mt-3 font-serif text-lg italic text-[var(--emerald-deep)]">
          ₹{price}
          {price !== item.price && (
            <span className="ml-2 text-[11px] not-italic text-muted-foreground line-through">
              ₹{item.price}
            </span>
          )}
        </p>
        {item.variants && <div className="mt-3 inline-flex rounded-full border border-[var(--emerald)]/25 bg-[var(--ivory)] p-1 text-xs font-bold"><span className="px-2 py-1.5 text-muted-foreground">Portion</span>{item.variants.map((option) => <button key={option.id} onClick={() => setVariantId(option.id)} className={`rounded-full px-3 py-1.5 ${variantId === option.id ? "bg-[var(--emerald-deep)] text-white" : "text-[var(--emerald-deep)]"}`}>{option.label} · ₹{priceAt(option.price, locId)}</button>)}</div>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button disabled={!available}
            onClick={onView}
            className="text-[11px] font-semibold uppercase tracking-widest text-[var(--emerald-deep)] underline decoration-[var(--brass)] underline-offset-4"
          >
            Details
          </button>
          <div className="inline-flex items-center overflow-hidden rounded-full border border-[var(--emerald)]/25 bg-white sm:ml-auto" aria-label={`Quantity for ${item.name}`}>
            <button type="button" disabled={!available || qty <= 1} onClick={() => setQty((value) => Math.max(1, value - 1))} className="grid h-8 w-8 place-items-center text-[var(--emerald-deep)] disabled:opacity-35" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
            <input type="number" min="1" max="99" value={qty} disabled={!available} onChange={(event) => setQty(Math.min(99, Math.max(1, Number(event.target.value) || 1)))} className="h-8 w-9 border-x border-[var(--emerald)]/15 bg-transparent text-center text-xs font-bold outline-none disabled:opacity-40" aria-label="Quantity" />
            <button type="button" disabled={!available || qty >= 99} onClick={() => setQty((value) => Math.min(99, value + 1))} className="grid h-8 w-8 place-items-center text-[var(--emerald-deep)] disabled:opacity-35" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <button disabled={!available}
            onClick={() => {
              add({ itemId: variant?.id ?? item.id, name: variant ? `${item.name} (${variant.label})` : item.name, image: item.image, unitPrice: price, qty });
              toast.success(`${qty} × ${variant ? `${item.name} (${variant.label})` : item.name} added`);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)] disabled:bg-stone-400"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {available ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
      <Link
        to="/dish/$id"
        params={{ id: item.id }}
        className="relative aspect-[16/9] w-full shrink-0 overflow-hidden xl:aspect-square xl:w-40"
      >
        <img
          src={dishUrl(item.image)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
    </article>
  );
}

function DishSheet({
  item,
  locId,
  onClose,
}: {
  item: MenuItem;
  locId: "ratna" | "deluxe";
  onClose: () => void;
}) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(item.variants?.[0]?.id ?? "");
  const variant = item.variants?.find((option) => option.id === variantId);
  const price = priceAt(variant?.price ?? item.price, locId);
  const nutrition = nutritionFor(item);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white md:rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10]">
          <img src={dishUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-foreground shadow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <h2 className="font-serif text-3xl">{item.name}</h2>
          <p className="mt-1 font-serif text-xl italic text-[var(--emerald-deep)]">
            ₹{price}
            {price !== item.price && (
              <span className="ml-2 text-xs not-italic text-muted-foreground">
                Ratna price ₹{item.price}
              </span>
            )}
          </p>
          {item.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}
          {item.variants && <div className="mt-4 flex gap-2">{item.variants.map((option) => <button key={option.id} onClick={() => setVariantId(option.id)} className={`rounded-full border px-4 py-2 text-sm font-bold ${variantId === option.id ? "border-[var(--emerald-deep)] bg-[var(--emerald-deep)] text-white" : "border-[var(--emerald)]/25"}`}>{option.label} · ₹{priceAt(option.price, locId)}</button>)}</div>}
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-[var(--ivory)] p-3 text-center"><Nutrition label="kcal" value={nutrition.calories} /><Nutrition label="protein" value={`${nutrition.protein}g`} /><Nutrition label="carbs" value={`${nutrition.carbs}g`} /><Nutrition label="fat" value={`${nutrition.fat}g`} /></div>
          <p className="mt-3 text-xs text-muted-foreground">Approximate nutrition per serving. {nutrition.benefits.join(" · ")}</p>
          <button
            onClick={() => {
              add({ itemId: variant?.id ?? item.id, name: variant ? `${item.name} (${variant.label})` : item.name, image: item.image, unitPrice: price });
              toast.success(`${variant ? `${item.name} (${variant.label})` : item.name} added`);
              onClose();
            }}
            className="mt-6 w-full rounded-full bg-[var(--emerald-deep)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]"
          >
            Add to order — ₹{price}
          </button>
        </div>
      </div>
    </div>
  );
}

function Nutrition({ label, value }: { label: string; value: string | number }) { return <span><b className="block text-sm text-[var(--emerald-deep)]">{value}</b><small className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</small></span>; }
