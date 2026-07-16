import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Minus, ShoppingCart, Sparkles, Flame } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { getItem, menuItems, dishUrl } from "@/data/menu";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/dish/$id")({
  head: ({ params }) => {
    const item = getItem(params.id);
    if (!item) return { meta: [{ title: "Dish — Ratna Deluxe" }] };
    return { meta: [
      { title: `${item.name} — Ratna Deluxe` },
      { name: "description", content: item.description ?? `Order ${item.name} at Ratna Deluxe, Kushaiguda.` },
      { property: "og:title", content: `${item.name} · ₹${item.price}` },
      { property: "og:description", content: item.description ?? "From the Ratna Deluxe kitchen." },
      { property: "og:image", content: dishUrl(item.image) },
    ] };
  },
  component: DishPage,
});

function DishPage() {
  const { id } = Route.useParams();
  const item = getItem(id);
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-serif text-3xl">Dish not on the menu</h1>
          <Link to="/menu" className="mt-6 inline-block rounded-full bg-[var(--emerald-deep)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">Back to menu</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const total = item.price * qty;
  const related = menuItems.filter((m) => m.category === item.category && m.id !== item.id).slice(0, 4);

  const onAdd = (goCart = false) => {
    add({ itemId: item.id, name: item.name, image: item.image, unitPrice: item.price, qty, notes: notes.trim() || undefined });
    toast.success(`Added ${qty} × ${item.name}`);
    if (goCart) navigate({ to: "/cart" });
  };

  return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-10">
        <button onClick={() => history.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-[var(--emerald)]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 md:grid-cols-2 md:px-10 md:py-12">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-[var(--brass)]/25 bg-white shadow-xl">
          <img src={dishUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
          {item.chefPick && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--brass)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]"><Sparkles className="h-3 w-3" /> Chef's Pick</span>}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block h-4 w-4 rounded-sm border-2 ${item.veg ? "border-green-600" : "border-red-600"} bg-white p-px`}>
              <span className={`block h-full w-full rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
            </span>
            {item.spicy && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-700">{"🌶".repeat(item.spicy)} Spicy</span>}
          </div>
          <h1 className="mt-3 font-serif text-5xl italic leading-tight">{item.name}</h1>
          <p className="mt-4 font-serif text-3xl text-[var(--emerald-deep)]">₹{item.price}</p>
          {item.description && <p className="mt-5 text-base leading-relaxed text-muted-foreground">{item.description}</p>}

          <div className="mt-8">
            <p className="eyebrow mb-2 text-muted-foreground">Special instructions</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 200))} rows={2} placeholder="Less spicy, no onion, extra gravy…" className="w-full resize-none rounded-sm border border-border bg-white p-3 text-sm outline-none focus:border-[var(--emerald)]" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={() => onAdd()} className="flex-1 rounded-full border-2 border-[var(--emerald-deep)] bg-white px-5 py-3 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)] hover:bg-secondary">
              Add · ₹{total}
            </button>
            <button onClick={() => onAdd(true)} className="flex-1 rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]">
              <span className="inline-flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" /> Order</span>
            </button>
          </div>

          <div className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-5">
            <p className="eyebrow flex items-center gap-1.5 text-[var(--emerald)]"><Flame className="h-3 w-3" /> From our kitchen</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Prepared fresh to order. Prices exclusive of GST. Dine-in preferred — ask your steward about today's specials.</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="px-4 py-16 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-serif text-3xl">You might also love</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} to="/dish/$id" params={{ id: r.id }} className="group overflow-hidden rounded-sm border border-[var(--brass)]/20 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={dishUrl(r.image)} alt={r.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-serif text-lg">{r.name}</h3>
                    <p className="mt-1 text-sm text-[var(--emerald-deep)]">₹{r.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </div>
  );
}
