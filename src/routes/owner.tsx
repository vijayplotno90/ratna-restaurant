import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BellRing, CheckCircle2, ClipboardCheck, Clock3, Crown, IndianRupee, Lock,
  LogIn, LogOut, MessageSquare, RefreshCw, Send, ShieldCheck, UsersRound, Zap,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ratnaOwnerLogin, ratnaOwnerOverview } from "@/lib/ratna-console.functions";

export const Route = createFileRoute("/owner")({ component: OwnerConsole });

type Credentials = { userId: string; password: string };
type OwnerData = Awaited<ReturnType<typeof ratnaOwnerOverview>>;
type Tab = "pnl" | "approvals" | "customers" | "visits" | "messages" | "automations" | "audit";

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not yet";

function OwnerConsole() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<OwnerData | null>(null);
  const [tab, setTab] = useState<Tab>("pnl");

  const signIn = async (input: Credentials) => {
    setBusy(true); setError("");
    try {
      await ratnaOwnerLogin({ data: input });
      setData(await ratnaOwnerOverview({ data: input }));
      setCredentials(input);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in"); }
    finally { setBusy(false); }
  };
  const refresh = async () => {
    if (!credentials) return;
    setBusy(true); setError("");
    try { setData(await ratnaOwnerOverview({ data: credentials })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to refresh"); }
    finally { setBusy(false); }
  };

  return <div className="public-page min-h-screen"><SiteNav />
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      {!credentials ? <OwnerLogin busy={busy} error={error} onSignIn={signIn} /> :
        <Dashboard data={data} tab={tab} setTab={setTab} busy={busy} error={error} onRefresh={refresh}
          onSignOut={() => { setCredentials(null); setData(null); setTab("pnl"); }} />}
    </main><SiteFooter />
  </div>;
}

function OwnerLogin({ busy, error, onSignIn }: { busy: boolean; error: string; onSignIn: (input: Credentials) => Promise<void> }) {
  const [userId, setUserId] = useState(""); const [password, setPassword] = useState("");
  return <section className="mx-auto max-w-md rounded-sm border border-[var(--brass)]/30 bg-white p-7 shadow-sm">
    <Crown className="h-7 w-7 text-[var(--brass)]" /><p className="mt-5 eyebrow text-[var(--brass)]">Ratna Owner</p>
    <h1 className="mt-2 font-serif text-4xl italic text-[var(--emerald-deep)]">Owner console</h1>
    <p className="mt-2 text-sm text-muted-foreground">Product, finance, customer relationships, growth and audit control.</p>
    {error && <p className="mt-4 rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={(event) => { event.preventDefault(); void onSignIn({ userId, password }); }} className="mt-6 space-y-3">
      <input required value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Owner user ID" className="w-full rounded-sm border border-border p-3 text-sm" />
      <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-sm border border-border p-3 text-sm" />
      <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--emerald-deep)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--ivory)] disabled:opacity-60"><LogIn className="h-4 w-4" />{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="mt-5 flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-[var(--emerald)]" />Demo access is for presentation only. Replace it before real staff access.</p>
  </section>;
}

function Dashboard({ data, tab, setTab, busy, error, onRefresh, onSignOut }: { data: OwnerData | null; tab: Tab; setTab: (tab: Tab) => void; busy: boolean; error: string; onRefresh: () => Promise<void>; onSignOut: () => void }) {
  const model = useMemo(() => buildModel(data), [data]);
  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "pnl", label: "Profit & Loss", icon: IndianRupee }, { key: "approvals", label: "Approvals", icon: ClipboardCheck },
    { key: "customers", label: "Customer Insights", icon: UsersRound }, { key: "visits", label: "Unfinished Visits", icon: Clock3 },
    { key: "messages", label: "Messages", icon: MessageSquare }, { key: "automations", label: "Automations", icon: Zap }, { key: "audit", label: "Audit Log", icon: BellRing },
  ];
  return <>
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--brass)]/25 pb-6">
      <div><p className="eyebrow text-[var(--brass)]">Ratna Owner</p><h1 className="mt-2 font-serif text-4xl italic text-[var(--emerald-deep)]">Owner console</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome, <b>{data?.user.name}</b> — product, customer, growth and audit control.</p></div>
      <div className="flex flex-wrap gap-2"><a href="/admin/" className="pill-action">Manage website</a><Link to="/" className="pill-action">View storefront</Link>
        <button onClick={() => void onRefresh()} disabled={busy} className="pill-action"><RefreshCw className="h-3.5 w-3.5" />Refresh</button><button onClick={onSignOut} className="pill-action"><LogOut className="h-3.5 w-3.5" />Logout</button></div>
    </header>
    {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-[var(--brass)]/25" aria-label="Owner console sections">{tabs.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => setTab(key)} className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold ${tab === key ? "border-[var(--emerald)] text-[var(--emerald-deep)]" : "border-transparent text-muted-foreground hover:text-[var(--emerald-deep)]"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>
    {tab === "pnl" && <PnLTab model={model} />}{tab === "approvals" && <ApprovalsTab />}{tab === "customers" && <CustomersTab model={model} />}
    {tab === "visits" && <VisitsTab />}{tab === "messages" && <MessagesTab messages={data?.messages ?? []} />}{tab === "automations" && <AutomationsTab campaigns={data?.campaigns ?? []} />}{tab === "audit" && <AuditTab audit={data?.audit ?? []} />}
  </>;
}

function buildModel(data: OwnerData | null) {
  const orders = (data?.orders ?? []).filter((order: any) => order.status !== "cancelled");
  const now = Date.now(); const periods = [1, 7, 30, 365];
  const totals = periods.map(days => { const rows = orders.filter((order: any) => now - new Date(order.created_at).getTime() <= days * 86400000); const revenue = rows.reduce((n: number, o: any) => n + Number(o.total), 0); return { days, revenue, orders: rows.length, gst: rows.reduce((n: number, o: any) => n + Number(o.gst_amount), 0) }; });
  const customers = new Map<string, any>();
  for (const order of orders as any[]) { const value = customers.get(order.customer_phone) ?? { name: order.customer_name, phone: order.customer_phone, orders: 0, revenue: 0, last: order.created_at }; value.orders++; value.revenue += Number(order.total); if (new Date(order.created_at) > new Date(value.last)) value.last = order.created_at; customers.set(order.customer_phone, value); }
  const profiles = new Map((data?.profiles ?? []).map((profile: any) => [profile.phone, profile]));
  const customerRows = [...customers.values()].map(customer => ({ ...customer, profile: profiles.get(customer.phone), daysSinceLast: Math.round((now - new Date(customer.last).getTime()) / 86400000) })).sort((a, b) => b.revenue - a.revenue);
  const dishes = new Map<string, { name: string; revenue: number; quantity: number }>();
  for (const item of (data?.items ?? []) as any[]) { const current = dishes.get(item.item_name) ?? { name: item.item_name, revenue: 0, quantity: 0 }; current.revenue += Number(item.unit_price) * Number(item.quantity); current.quantity += Number(item.quantity); dishes.set(item.item_name, current); }
  return { orders, totals, customerRows, topDishes: [...dishes.values()].sort((a,b) => b.revenue-a.revenue).slice(0,5) };
}

function PnLTab({ model }: { model: ReturnType<typeof buildModel> }) { const labels = ["Today", "Last 7 days", "Last 30 days", "Year to date"]; return <section className="mt-6 space-y-6">
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{model.totals.map((total, i) => <div key={total.days} className="owner-card"><p className="eyebrow">{labels[i]}</p><p className="mt-2 font-serif text-3xl italic text-[var(--emerald-deep)]">{money(total.revenue)}</p><p className="mt-1 text-xs font-semibold text-[var(--emerald)]">Net {money(total.revenue - total.revenue * .42)}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{total.orders} orders · GST {money(total.gst)}</p></div>)}</div>
  <div className="owner-card"><p className="eyebrow">Tax-ready operations</p><h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">Clean records for the CA</h2><p className="mt-2 text-sm text-muted-foreground">All Ratna orders retain their sales and GST value. The next finance export will group invoices by period for a one-click CA download.</p></div>
  <div className="grid gap-5 lg:grid-cols-2"><div className="owner-card"><h2 className="font-serif text-xl italic text-[var(--emerald-deep)]">Top dishes by revenue</h2><div className="mt-4 space-y-3">{model.topDishes.map(dish => <div key={dish.name} className="flex justify-between border-b border-[var(--brass)]/15 pb-2 text-sm"><span>{dish.name}<span className="ml-2 text-xs text-muted-foreground">{dish.quantity} sold</span></span><b>{money(dish.revenue)}</b></div>)}</div></div><div className="owner-card"><h2 className="font-serif text-xl italic text-[var(--emerald-deep)]">Commercial view</h2><p className="mt-3 text-sm text-muted-foreground">COGS is shown at the Sri Ram reference assumption of 42% until Ratna’s actual recipe costs are entered.</p><p className="mt-5 text-3xl font-serif italic text-[var(--emerald-deep)]">{money(model.totals[3]?.revenue ?? 0)}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">Recorded sales</p></div></div>
</section>; }

function ApprovalsTab() { return <section className="mt-6 owner-card"><p className="eyebrow">Owner approval protects the live menu</p><h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">Approvals</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Administrators will submit proposed menu, category and website changes here. Nothing customer-facing should publish until the owner approves it.</p><div className="mt-6 flex items-center gap-3 rounded-sm bg-[var(--ivory)] p-5"><CheckCircle2 className="h-6 w-6 text-[var(--emerald)]" /><p className="text-sm"><b>No pending approvals.</b><br /><span className="text-muted-foreground">The demo workspace is ready for the first submitted change.</span></p></div></section>; }

function CustomersTab({ model }: { model: ReturnType<typeof buildModel> }) { const segments = { regular: model.customerRows.filter(c => c.orders >= 3 && c.daysSinceLast <= 30), atRisk: model.customerRows.filter(c => c.orders >= 2 && c.daysSinceLast > 30), new: model.customerRows.filter(c => c.orders === 1) }; return <section className="mt-6 space-y-5"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Known customers" value={String(model.customerRows.length)} /><Stat label="Regulars" value={String(segments.regular.length)} /><Stat label="At risk" value={String(segments.atRisk.length)} /><Stat label="New customers" value={String(segments.new.length)} /></div><div className="owner-card overflow-x-auto"><div className="flex items-end justify-between gap-3"><div><p className="eyebrow">Consent-based profiles</p><h2 className="mt-1 font-serif text-2xl italic text-[var(--emerald-deep)]">Customer & family profiles</h2></div><button className="pill-action"><Send className="h-3.5 w-3.5" />Compose to segment</button></div><table className="mt-5 w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[var(--brass)]/25 text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="pb-3">Customer</th><th className="pb-3">Orders</th><th className="pb-3">Revenue</th><th className="pb-3">Last order</th><th className="pb-3">Preferences</th><th className="pb-3">Consent</th></tr></thead><tbody>{model.customerRows.map(c => <tr key={c.phone} className="border-b border-[var(--brass)]/10"><td className="py-3"><b>{c.name}</b><br /><span className="text-xs text-muted-foreground">{c.phone}</span></td><td>{c.orders}</td><td>{money(c.revenue)}</td><td>{c.daysSinceLast}d ago</td><td className="max-w-[180px] text-xs">{c.profile?.preferences?.join(" · ") ?? "Not recorded"}</td><td>{c.profile?.marketing_consent ? <span className="text-[var(--emerald)]">Approved</span> : <span className="text-muted-foreground">Service only</span>}</td></tr>)}</tbody></table></div></section>; }

function VisitsTab() { return <section className="mt-6 owner-card"><p className="eyebrow">Customer recovery</p><h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">Known customers who paused their food journey</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Signed-in customers who view the menu, a dish or cart and remain inactive for at least 60 minutes will appear here. A reminder always needs marketing consent and must never imply that Ratna watched their activity.</p><div className="mt-6 grid grid-cols-3 gap-3"><Stat label="Unfinished visits" value="0" /><Stat label="Consented contacts" value="0" /><Stat label="Consent required" value="0" /></div><p className="mt-6 rounded-sm bg-[var(--ivory)] p-4 text-sm text-muted-foreground">Sending is intentionally locked until Ratna connects approved WhatsApp templates or SMS DLT.</p></section>; }

function MessagesTab({ messages }: { messages: any[] }) { return <section className="mt-6 owner-card"><p className="eyebrow">Delivery history</p><h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">Customer messages</h2>{messages.length ? <div className="mt-5 space-y-3">{messages.map(message => <div key={message.id} className="rounded-sm border border-[var(--brass)]/20 p-4"><b className="uppercase text-[var(--emerald-deep)]">{message.channel}</b><p className="mt-1 text-sm">{message.body}</p><p className="mt-2 text-xs text-muted-foreground">{dateTime(message.sent_at ?? message.created_at)}</p></div>)}</div> : <p className="mt-5 rounded-sm bg-[var(--ivory)] p-4 text-sm text-muted-foreground">No customer messages have been sent yet. Campaign runs will be recorded here.</p>}</section>; }

function AutomationsTab({ campaigns }: { campaigns: any[] }) { return <section className="mt-6 space-y-4"><div><p className="eyebrow">Owner-only promotional automations</p><h2 className="mt-1 font-serif text-2xl italic text-[var(--emerald-deep)]">Campaigns and celebrations</h2><p className="mt-1 text-sm text-muted-foreground">Meal-slot, birthday, anniversary and festival campaigns. Scheduled delivery needs the approved WhatsApp or SMS connection.</p></div><div className="grid gap-4 md:grid-cols-2">{campaigns.map(campaign => <article key={campaign.id} className="owner-card"><div className="flex justify-between gap-3"><div><h3 className="font-serif text-xl italic text-[var(--emerald-deep)]">{campaign.name}</h3><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{campaign.trigger_type} · {campaign.schedule_label}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${campaign.enabled ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>{campaign.enabled ? "Active" : "Paused"}</span></div><p className="mt-4 text-sm text-muted-foreground">{campaign.message}</p><div className="mt-5 flex items-center justify-between text-xs"><span>Audience: <b>{campaign.audience}</b></span><span>Last run: {dateTime(campaign.last_run_at)}</span></div></article>)}</div></section>; }

function AuditTab({ audit }: { audit: any[] }) { return <section className="mt-6 owner-card"><p className="eyebrow">Accountability</p><h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">Audit log</h2>{audit.length ? <div className="mt-5 divide-y divide-[var(--brass)]/15">{audit.map(entry => <div key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><b>{entry.action.replaceAll("_", " ")}</b><span className="ml-2 text-muted-foreground">by {entry.actor_user_id}</span></span><span className="text-xs text-muted-foreground">{dateTime(entry.created_at)}</span></div>)}</div> : <p className="mt-5 rounded-sm bg-[var(--ivory)] p-4 text-sm text-muted-foreground">No owner actions have been recorded yet. Approvals and campaign actions will create an audit trail.</p>}</section>; }

function Stat({ label, value }: { label: string; value: string }) { return <div className="owner-card"><p className="font-serif text-3xl italic text-[var(--emerald-deep)]">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>; }
