import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Phone, MapPin, Printer, Clock3 } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { RESTAURANT } from "@/data/menu";
import { useOrders } from "@/lib/admin-store";

export const Route = createFileRoute("/order/$id")({
  head: () => ({ meta: [{ title: "Order Confirmed — Ratna Deluxe" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { list, hydrated } = useOrders();
  const order = list.find((item) => item.id === id);
  const stage = order?.status === "new" ? "Order received" : order?.status === "preparing" ? "Being prepared" : order?.status === "ready" ? "Ready for pickup" : order?.status === "out" ? "Out for delivery" : order?.status === "delivered" ? "Delivered" : "Order confirmed";
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SiteNav />
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--emerald)]/10">
          <CheckCircle2 className="h-12 w-12 text-[var(--emerald)]" />
        </div>
        <h1 className="mt-6 font-serif text-4xl italic">Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">{order ? `Live status: ${stage}.` : hydrated ? "The kitchen is on it. Thank you for choosing Ratna Deluxe." : "Loading your order…"}</p>
        <div className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6 text-left">
          <p className="eyebrow text-muted-foreground">Order ID</p>
          <p className="mt-1 font-mono text-2xl font-bold">#{id.toUpperCase()}</p>
          <div className="my-4 brass-rule" />
          {order && <><div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="inline-flex items-center gap-1 font-semibold text-[var(--emerald-deep)]"><Clock3 className="h-3.5 w-3.5" />{stage}</span></div><div className="my-4 brass-rule" /><ul className="space-y-2 text-sm">{order.items.map((item, index) => <li key={`${item.id}-${index}`} className="flex justify-between"><span>{item.qty} × {item.name}</span><span>₹{item.qty * item.price}</span></li>)}</ul><div className="my-4 brass-rule" /><div className="space-y-1 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div><div className="flex justify-between text-muted-foreground"><span>GST</span><span>₹{order.gst}</span></div><div className="flex justify-between font-serif text-xl italic"><span>Total</span><span>₹{order.total}</span></div></div><div className="my-4 brass-rule" /></>}
          <p className="text-sm text-muted-foreground">Estimated time</p>
          <p className="mt-0.5 font-serif text-xl">25 – 35 minutes</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold hover:border-[var(--emerald)]"><Phone className="h-4 w-4" /> Call the restaurant</a>
          <a href={RESTAURANT.map} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold hover:border-[var(--emerald)]"><MapPin className="h-4 w-4" /> Directions</a>
          <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-sm font-bold uppercase tracking-widest text-[var(--ivory)]">Order more</Link>
          {order && <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold hover:border-[var(--emerald)]"><Printer className="h-4 w-4" /> Print receipt</button>}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
