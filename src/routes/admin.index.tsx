import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Bike, IndianRupee, Inbox, Clock, ArrowRight } from "lucide-react";
import { useEnquiries, useOrders, useReservations } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const r = useReservations();
  const o = useOrders();
  const e = useEnquiries();

  const today = new Date().toISOString().slice(0, 10);
  const todayRes = r.list.filter((x) => x.date === today);
  const todayOrders = o.list.filter((x) => sameDay(x.createdAt, Date.now()));
  const revenue = todayOrders.filter((x) => x.status !== "cancelled").reduce((n, x) => n + x.total, 0);
  const pendingDeliveries = o.list.filter((x) => x.mode === "delivery" && !["delivered", "cancelled"].includes(x.status)).length;
  const unread = e.list.filter((x) => x.status === "unread").length;

  const recent = [
    ...r.list.slice(0, 6).map((x) => ({ kind: "res" as const, id: x.id, when: x.createdAt, text: `${x.name} · ${x.guests} guests · ${x.date} ${x.time}` })),
    ...o.list.slice(0, 6).map((x) => ({ kind: "ord" as const, id: x.id, when: x.createdAt, text: `${x.name} · ₹${x.total} · ${x.mode}` })),
    ...e.list.slice(0, 6).map((x) => ({ kind: "enq" as const, id: x.id, when: x.createdAt, text: `${x.name} · ${x.message.slice(0, 60)}` })),
  ].sort((a, b) => b.when - a.when).slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Header title="Today at Ratna" sub={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat icon={CalendarCheck} label="Reservations" value={todayRes.length} sub={`${r.list.filter((x) => x.status === "pending").length} pending`} to="/admin/reservations" />
        <Stat icon={Bike} label="Orders today" value={todayOrders.length} sub={`${pendingDeliveries} out for delivery`} to="/admin/orders" />
        <Stat icon={IndianRupee} label="Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} sub="Excl. cancelled" to="/admin/orders" />
        <Stat icon={Inbox} label="Enquiries" value={unread} sub={`${e.list.length} total`} to="/admin/enquiries" />
      </div>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
          <h3 className="font-serif text-xl">Recent activity</h3>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No activity yet. When guests reserve, order, or send an enquiry it'll show up here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((x) => (
                <li key={`${x.kind}-${x.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold ${x.kind === "res" ? "bg-[var(--emerald)]/15 text-[var(--emerald-deep)]" : x.kind === "ord" ? "bg-[var(--brass)]/20 text-[var(--emerald-deep)]" : "bg-purple-100 text-purple-800"}`}>{x.kind.toUpperCase()}</span>
                    <span>{x.text}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{timeAgo(x.when)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-6">
          <h3 className="font-serif text-xl">Quick jumps</h3>
          <div className="mt-4 space-y-2">
            <QuickLink to="/admin/reservations" label="Manage today's bookings" />
            <QuickLink to="/admin/orders" label="Kitchen queue" />
            <QuickLink to="/admin/menu" label="Edit menu / mark 86'd" />
            <QuickLink to="/admin/settings" label="Restaurant settings" />
          </div>
        </div>
      </section>
    </div>
  );
}

function sameDay(a: number, b: number) {
  const A = new Date(a), B = new Date(b);
  return A.getFullYear() === B.getFullYear() && A.getMonth() === B.getMonth() && A.getDate() === B.getDate();
}
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="border-b border-[var(--brass)]/25 pb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brass)]">Ratna Admin</p>
      <h1 className="mt-2 font-serif text-4xl italic text-[var(--emerald-deep)]">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, to }: { icon: React.ElementType; label: string; value: string | number; sub?: string; to: string }) {
  return (
    <Link to={to} className="group rounded-sm border border-[var(--brass)]/25 bg-white p-5 transition hover:border-[var(--emerald)] hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--emerald-deep)]/10 text-[var(--emerald-deep)]"><Icon className="h-4 w-4" /></span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[var(--emerald-deep)]" />
      </div>
      <p className="mt-4 font-serif text-3xl italic text-[var(--emerald-deep)]">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Link>
  );
}
function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-sm hover:border-[var(--emerald)] hover:bg-[var(--emerald)]/5">
      {label}<ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
