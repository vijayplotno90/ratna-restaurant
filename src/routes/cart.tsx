import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { dishUrl } from "@/data/menu";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Order — Ratna Deluxe" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, update, remove, subtotal } = useCart();
  const gst = Math.round(subtotal * 0.05);
  const service = subtotal > 0 ? 30 : 0;
  const total = subtotal + gst + service;
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <p className="eyebrow text-[var(--emerald)]">Your table</p>
        <h1 className="mt-2 font-serif text-4xl italic md:text-5xl">Your Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"} · Review before checkout</p>
        {items.length === 0 ? (
          <div className="mt-14 grid place-items-center rounded-sm border border-dashed border-[var(--brass)]/40 bg-white p-16 text-center">
            <ShoppingBag className="h-10 w-10 text-[var(--brass)]" />
            <h2 className="mt-4 font-serif text-2xl">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a biryani, a tandoori plate, a sweet to finish.</p>
            <Link to="/menu" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-7 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">Browse menu</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.key} className="flex gap-4 rounded-sm border border-[var(--brass)]/20 bg-white p-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-muted">
                    <img src={dishUrl(it.image)} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-lg leading-tight">{it.name}</h4>
                      <button onClick={() => remove(it.key)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {it.notes && <p className="mt-1 rounded bg-[var(--brass)]/10 px-2 py-1 text-xs italic">"{it.notes}"</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button onClick={() => update(it.key, { qty: Math.max(1, it.qty - 1) })} className="grid h-8 w-8 place-items-center text-[var(--emerald-deep)]"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-sm font-bold">{it.qty}</span>
                        <button onClick={() => update(it.key, { qty: it.qty + 1 })} className="grid h-8 w-8 place-items-center text-[var(--emerald-deep)]"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="font-serif text-lg text-[var(--emerald-deep)]">₹{it.unitPrice * it.qty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
                <h3 className="font-serif text-2xl">Bill</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={`₹${subtotal}`} />
                  <Row label="Service" value={`₹${service}`} />
                  <Row label="GST (5%)" value={`₹${gst}`} />
                </div>
                <div className="my-4 brass-rule" />
                <div className="flex items-center justify-between font-serif text-2xl italic"><span>Total</span><span className="text-[var(--emerald-deep)]">₹{total}</span></div>
                <Link to="/checkout" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--emerald-deep)] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/menu" className="mt-3 block text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-[var(--emerald)]">+ Add more items</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>;
}