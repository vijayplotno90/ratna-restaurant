import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
  Download,
  FileText,
  ReceiptText,
  UsersRound,
  WalletCards,
  CalendarClock,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import { useAutomations, useCustomerProfiles, useOrders, type Order } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/owner")({ component: () => <Navigate to="/owner" /> });

const rupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const makeCsv = (columns: string[], rows: unknown[][]) =>
  [columns.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");

function download(filename: string, contents: BlobPart, type = "text/csv;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function OwnerPage() {
  const { list } = useOrders();
  const { list: profiles } = useCustomerProfiles();
  const automations = useAutomations();
  const [query, setQuery] = useState("");
  const paidOrders = useMemo(() => list.filter((order) => order.status !== "cancelled"), [list]);
  const customers = useMemo(() => {
    const byPhone = new Map<string, { name: string; phone: string; orders: Order[] }>();
    for (const order of paidOrders) {
      const customer = byPhone.get(order.phone) ?? {
        name: order.name,
        phone: order.phone,
        orders: [],
      };
      customer.orders.push(order);
      byPhone.set(order.phone, customer);
    }
    return [...byPhone.values()]
      .map((customer) => ({
        ...customer,
        spent: customer.orders.reduce((sum, order) => sum + order.total, 0),
        lastOrder: customer.orders[0],
      }))
      .sort((a, b) => b.spent - a.spent);
  }, [paidOrders]);
  const visibleCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()),
  );
  const sales = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const gst = paidOrders.reduce((sum, order) => sum + order.gst, 0);
  const averageBill = paidOrders.length ? sales / paidOrders.length : 0;
  const enrichedCustomers = visibleCustomers.map((customer) => ({
    ...customer,
    profile: profiles.find((profile) => profile.phone === customer.phone),
  }));
  const today = Date.now();
  const segments = {
    vip: customers.filter((customer) => customer.spent >= 1000),
    regular: customers.filter((customer) => customer.orders.length >= 2 && customer.spent < 1000),
    atRisk: customers.filter(
      (customer) => today - customer.lastOrder.createdAt > 30 * 24 * 60 * 60 * 1000,
    ),
    new: customers.filter((customer) => customer.orders.length === 1),
  };

  const salesRegisterCsv = () =>
    makeCsv(
      [
        "Invoice / Order",
        "Date",
        "Customer",
        "Phone",
        "Mode",
        "Payment",
        "Subtotal",
        "Delivery",
        "GST",
        "Total",
        "Status",
      ],
      paidOrders.map((o) => [
        o.id.toUpperCase(),
        new Date(o.createdAt).toLocaleString("en-IN"),
        o.name,
        o.phone,
        o.mode,
        o.pay,
        o.subtotal,
        o.delivery,
        o.gst,
        o.total,
        o.status,
      ]),
    );
  const gstReportCsv = () =>
    makeCsv(
      ["Period", "Completed orders", "Taxable sales", "GST collected", "Gross sales"],
      [
        [
          "All recorded orders",
          paidOrders.length,
          paidOrders.reduce((sum, o) => sum + o.subtotal + o.delivery, 0),
          gst,
          sales,
        ],
      ],
    );
  const customerLedgerCsv = () =>
    makeCsv(
      ["Customer", "Phone", "Orders", "Lifetime spend", "Last order"],
      customers.map((c) => [
        c.name,
        c.phone,
        c.orders.length,
        c.spent,
        new Date(c.lastOrder.createdAt).toLocaleString("en-IN"),
      ]),
    );
  const salesRegister = () => download("ratna-sales-register.csv", salesRegisterCsv());
  const gstReport = () => download("ratna-gst-summary.csv", gstReportCsv());
  const customerLedger = () => download("ratna-customer-ledger.csv", customerLedgerCsv());
  const caBundle = async () => {
    const zip = new JSZip();
    zip.file("ratna-sales-register.csv", salesRegisterCsv());
    zip.file("ratna-gst-summary.csv", gstReportCsv());
    zip.file("ratna-customer-ledger.csv", customerLedgerCsv());
    zip.file(
      "README.txt",
      "Ratna Deluxe CA export bundle\n\nIncludes all recorded non-cancelled orders, a GST summary, and a customer ledger. Generated: " +
        new Date().toLocaleString("en-IN"),
    );
    download(
      `ratna-ca-export-${new Date().toISOString().slice(0, 10)}.zip`,
      await zip.generateAsync({ type: "blob" }),
      "application/zip",
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Header
        title="Owner & Finance"
        sub="A clean operating view for customers, receipts and accountant-ready records."
      />
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={WalletCards} label="Recorded sales" value={rupees(sales)} />
        <Stat icon={ReceiptText} label="GST collected" value={rupees(gst)} />
        <Stat icon={UsersRound} label="Known customers" value={customers.length.toString()} />
        <Stat icon={FileText} label="Average bill" value={rupees(averageBill)} />
      </section>
      <section className="mt-8 rounded-sm border border-[var(--brass)]/35 bg-[var(--brass)]/10 p-5">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brass)]" />
          <div>
            <p className="font-semibold text-[var(--emerald-deep)]">
              Presentation data is switched on
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The sample orders, customer profiles and campaign examples below show how Ratna grows
              into an operating system. They are clearly marked demo data and will sit alongside
              real orders placed through checkout.
            </p>
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-[var(--brass)]">CA-ready exports</p>
            <h2 className="mt-1 text-2xl italic">Everything from one place</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Download the sales register, GST summary and customer ledger separately, or send the
              complete ZIP bundle straight to your CA. Every export reflects recorded non-cancelled
              orders.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ExportButton label="Download CA ZIP" onClick={() => void caBundle()} />
            <ExportButton label="Sales register" onClick={salesRegister} />
            <ExportButton label="GST summary" onClick={gstReport} />
            <ExportButton label="Customer ledger" onClick={customerLedger} />
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-[var(--brass)]">Customer relationships</p>
            <h2 className="mt-1 text-2xl italic">Guests who come back</h2>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or phone"
            className="w-full rounded-sm border border-border px-3 py-2 text-sm sm:w-64"
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Segment label="VIP guests" hint="High lifetime value" count={segments.vip.length} />
          <Segment label="Regulars" hint="2+ Ratna orders" count={segments.regular.length} />
          <Segment label="At-risk" hint="No order in 30 days" count={segments.atRisk.length} />
          <Segment label="New guests" hint="First recorded order" count={segments.new.length} />
        </div>
        {enrichedCustomers.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No customer orders yet. New checkouts will automatically form customer histories here.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {enrichedCustomers.map((customer) => (
              <article key={customer.phone} className="rounded-sm border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-sm text-[var(--emerald-deep)] hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </div>
                  <p className="font-serif text-xl italic text-[var(--emerald-deep)]">
                    {rupees(customer.spent)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-secondary px-2 py-1 font-semibold">
                    {customer.orders.length} orders
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1">
                    Last visit {new Date(customer.lastOrder.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  {customer.profile?.consent ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-green-800">
                      <ShieldCheck className="h-3 w-3" />
                      Marketing consent
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">
                      Service only
                    </span>
                  )}
                </div>
                {customer.profile && (
                  <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    <p>{customer.profile.preferences?.join(" · ") || "No preferences recorded"}</p>
                    {customer.profile.birthday && (
                      <p className="mt-1">
                        Birthday{" "}
                        {new Date(customer.profile.birthday).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        {customer.profile.anniversary
                          ? ` · Anniversary ${new Date(customer.profile.anniversary).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                          : ""}
                      </p>
                    )}
                    {customer.profile.notes && (
                      <p className="mt-1 italic">{customer.profile.notes}</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-[var(--brass)]">Growth automation</p>
            <h2 className="mt-1 text-2xl italic">Campaigns that stay human</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Automations organise consented audiences and prepared messages. “Run now” records a
              test run in this demo; connecting WhatsApp or SMS is a separate, secure live step.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-[var(--emerald)]" />
            {automations.list.filter((item) => item.enabled).length} active
          </span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {automations.list.map((automation) => (
            <article key={automation.id} className="rounded-sm border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{automation.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{automation.schedule}</p>
                </div>
                <button
                  onClick={() =>
                    automations.update(automation.id, { enabled: !automation.enabled })
                  }
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${automation.enabled ? "bg-green-100 text-green-800" : "bg-secondary text-muted-foreground"}`}
                >
                  {automation.enabled ? "Active" : "Paused"}
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {automation.message}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                  {automation.audience} audience
                </span>
                <button
                  onClick={() => automations.update(automation.id, { lastRun: Date.now() })}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ivory)]"
                >
                  <Play className="h-3 w-3" />
                  Run demo
                </button>
              </div>
              {automation.lastRun && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Last demo run {new Date(automation.lastRun).toLocaleString("en-IN")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5">
      <Icon className="h-4 w-4 text-[var(--brass)]" />
      <p className="mt-3 font-serif text-3xl italic text-[var(--emerald-deep)]">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
function Segment({ label, hint, count }: { label: string; hint: string; count: number }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/20 bg-[var(--ivory)]/60 p-3">
      <p className="font-serif text-2xl italic text-[var(--emerald-deep)]">{count}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
