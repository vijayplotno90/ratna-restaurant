import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bike, Store, Phone, MapPin, Printer, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { useOrders, type Order } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const DELIVERY_STAGES: Order["status"][] = ["new", "preparing", "ready", "out", "delivered"];
const PICKUP_STAGES: Order["status"][] = ["new", "preparing", "ready", "delivered"];
const LABEL: Record<Order["status"], string> = {
  new: "New", preparing: "Preparing", ready: "Ready", out: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};

function OrdersPage() {
  const { list, update } = useOrders();
  const [selected, setSelected] = useState<Order | null>(null);
  const cols = useMemo(() => {
    const stages: Order["status"][] = ["new", "preparing", "ready", "out", "delivered"];
    return stages.map((s) => ({ status: s, items: list.filter((o) => o.status === s) }));
  }, [list]);

  const advance = (o: Order) => {
    const path = o.mode === "delivery" ? DELIVERY_STAGES : PICKUP_STAGES;
    const idx = path.indexOf(o.status);
    if (idx < 0 || idx >= path.length - 1) return;
    update(o.id, { status: path[idx + 1] });
    toast.success(`Moved to ${LABEL[path[idx + 1]]}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <Header title="Orders & Delivery" sub={`${list.length} lifetime · ${list.filter((o) => !["delivered", "cancelled"].includes(o.status)).length} live`} />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cols.map((c) => (
          <div key={c.status} className="rounded-sm border border-[var(--brass)]/25 bg-white/60">
            <div className="flex items-center justify-between border-b border-[var(--brass)]/25 bg-[var(--emerald-deep)] px-3 py-2 text-[var(--ivory)]">
              <h4 className="text-[11px] font-bold uppercase tracking-widest">{LABEL[c.status]}</h4>
              <span className="rounded-full bg-[var(--brass)] px-2 text-[10px] font-bold text-[var(--emerald-deep)]">{c.items.length}</span>
            </div>
            <div className="space-y-2 p-2">
              {c.items.length === 0 && <p className="p-2 text-xs text-muted-foreground">—</p>}
              {c.items.map((o) => (
                <button key={o.id} onClick={() => setSelected(o)} className="block w-full rounded-sm border border-border bg-white p-3 text-left text-sm hover:border-[var(--emerald)]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{o.name}</span>
                    <span className="font-bold text-[var(--emerald-deep)]">₹{o.total}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{o.items.length} items · {o.mode}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">{o.mode === "delivery" ? <Bike className="h-3 w-3" /> : <Store className="h-3 w-3" />}{o.pay.toUpperCase()}</span>
                    {o.status !== "delivered" && o.status !== "cancelled" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)] px-2 py-0.5 text-[10px] font-bold text-[var(--ivory)]" onClick={(e) => { e.stopPropagation(); advance(o); }}>Next<ChevronRight className="h-3 w-3" /></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && <OrderDrawer order={list.find((o) => o.id === selected.id) ?? selected} onClose={() => setSelected(null)} advance={advance} update={update} />}
    </div>
  );
}

function OrderDrawer({ order, onClose, advance, update }: { order: Order; onClose: () => void; advance: (o: Order) => void; update: (id: string, patch: Partial<Order>) => void }) {
  const print = () => window.print();
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl italic text-[var(--emerald-deep)]">Order #{order.id}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>

        <div className="mt-4 rounded-sm border border-border p-3">
          <p className="font-semibold">{order.name}</p>
          <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 text-sm text-[var(--emerald-deep)]"><Phone className="h-3 w-3" />{order.phone}</a>
          {order.address && <p className="mt-2 inline-flex items-start gap-1 text-sm"><MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />{order.address}{order.distanceKm !== undefined && <span className="ml-1 text-muted-foreground">· {order.distanceKm.toFixed(1)} km</span>}</p>}
          {order.notes && <p className="mt-2 rounded bg-secondary p-2 text-xs">📝 {order.notes}</p>}
        </div>

        <ul className="mt-4 divide-y divide-border text-sm">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between py-2"><span>{it.qty} × {it.name}</span><span>₹{it.qty * it.price}</span></li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{order.delivery === 0 ? "FREE" : `₹${order.delivery}`}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>GST</span><span>₹{order.gst}</span></div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-serif text-xl italic"><span>Total</span><span className="text-[var(--emerald-deep)]">₹{order.total}</span></div>
        </div>

        {order.mode === "delivery" && (
          <div className="mt-4">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Rider</label>
            <input value={order.rider ?? ""} onChange={(e) => update(order.id, { rider: e.target.value })} placeholder="Assign rider name"
              className="w-full rounded-sm border border-border bg-white p-2.5 text-sm" />
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button onClick={() => advance(order)} className="flex-1 rounded-full bg-[var(--emerald-deep)] py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]">
              Advance stage
            </button>
          )}
          <button onClick={print} title="Print bill" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary"><Printer className="h-4 w-4" /></button>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button onClick={() => { update(order.id, { status: "cancelled" }); toast("Order cancelled"); }} className="grid h-10 w-10 place-items-center rounded-full border border-red-300 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
          )}
        </div>
      </aside>
    </div>
  );
}
