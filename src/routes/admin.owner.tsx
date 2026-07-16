import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import { useOrders, type Order } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/owner")({ component: OwnerPage });

const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const makeCsv = (columns: string[], rows: unknown[][]) => [columns.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");

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
  const [query, setQuery] = useState("");
  const paidOrders = useMemo(() => list.filter((order) => order.status !== "cancelled"), [list]);
  const customers = useMemo(() => {
    const byPhone = new Map<string, { name: string; phone: string; orders: Order[] }>();
    for (const order of paidOrders) {
      const customer = byPhone.get(order.phone) ?? { name: order.name, phone: order.phone, orders: [] };
      customer.orders.push(order);
      byPhone.set(order.phone, customer);
    }
    return [...byPhone.values()].map((customer) => ({ ...customer, spent: customer.orders.reduce((sum, order) => sum + order.total, 0), lastOrder: customer.orders[0] })).sort((a, b) => b.spent - a.spent);
  }, [paidOrders]);
  const visibleCustomers = customers.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()));
  const sales = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const gst = paidOrders.reduce((sum, order) => sum + order.gst, 0);
  const averageBill = paidOrders.length ? sales / paidOrders.length : 0;

  const salesRegisterCsv = () => makeCsv(
    ["Invoice / Order", "Date", "Customer", "Phone", "Mode", "Payment", "Subtotal", "Delivery", "GST", "Total", "Status"],
    paidOrders.map((o) => [o.id.toUpperCase(), new Date(o.createdAt).toLocaleString("en-IN"), o.name, o.phone, o.mode, o.pay, o.subtotal, o.delivery, o.gst, o.total, o.status]),
  );
  const gstReportCsv = () => makeCsv(
    ["Period", "Completed orders", "Taxable sales", "GST collected", "Gross sales"],
    [["All recorded orders", paidOrders.length, paidOrders.reduce((sum, o) => sum + o.subtotal + o.delivery, 0), gst, sales]],
  );
  const customerLedgerCsv = () => makeCsv(
    ["Customer", "Phone", "Orders", "Lifetime spend", "Last order"],
    customers.map((c) => [c.name, c.phone, c.orders.length, c.spent, new Date(c.lastOrder.createdAt).toLocaleString("en-IN")]),
  );
  const salesRegister = () => download("ratna-sales-register.csv", salesRegisterCsv());
  const gstReport = () => download("ratna-gst-summary.csv", gstReportCsv());
  const customerLedger = () => download("ratna-customer-ledger.csv", customerLedgerCsv());
  const caBundle = async () => {
    const zip = new JSZip();
    zip.file("ratna-sales-register.csv", salesRegisterCsv());
    zip.file("ratna-gst-summary.csv", gstReportCsv());
    zip.file("ratna-customer-ledger.csv", customerLedgerCsv());
    zip.file("README.txt", "Ratna Deluxe CA export bundle\n\nIncludes all recorded non-cancelled orders, a GST summary, and a customer ledger. Generated: " + new Date().toLocaleString("en-IN"));
    download(`ratna-ca-export-${new Date().toISOString().slice(0, 10)}.zip`, await zip.generateAsync({ type: "blob" }), "application/zip");
  };

  return <div className="mx-auto max-w-6xl px-8 py-10">
    <Header title="Owner & Finance" sub="A clean operating view for customers, receipts and accountant-ready records." />
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat icon={WalletCards} label="Recorded sales" value={rupees(sales)} /><Stat icon={ReceiptText} label="GST collected" value={rupees(gst)} /><Stat icon={UsersRound} label="Known customers" value={customers.length.toString()} /><Stat icon={FileText} label="Average bill" value={rupees(averageBill)} /></section>
    <section className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow text-[var(--brass)]">CA-ready exports</p><h2 className="mt-1 text-2xl italic">Everything from one place</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Download the sales register, GST summary and customer ledger separately, or send the complete ZIP bundle straight to your CA. Every export reflects recorded non-cancelled orders.</p></div><div className="flex flex-wrap gap-2"><ExportButton label="Download CA ZIP" onClick={() => void caBundle()} /><ExportButton label="Sales register" onClick={salesRegister} /><ExportButton label="GST summary" onClick={gstReport} /><ExportButton label="Customer ledger" onClick={customerLedger} /></div></div>
    </section>
    <section className="mt-8 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow text-[var(--brass)]">Customer relationships</p><h2 className="mt-1 text-2xl italic">Guests who come back</h2></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or phone" className="w-full rounded-sm border border-border px-3 py-2 text-sm sm:w-64" /></div>
      {visibleCustomers.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">No customer orders yet. New checkouts will automatically form customer histories here.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-[var(--brass)]/25 text-[11px] font-bold uppercase tracking-widest text-muted-foreground"><tr><th className="pb-3">Guest</th><th className="pb-3">Phone</th><th className="pb-3">Orders</th><th className="pb-3">Lifetime value</th><th className="pb-3">Last order</th></tr></thead><tbody>{visibleCustomers.map((customer) => <tr key={customer.phone} className="border-b border-border/70"><td className="py-3 font-semibold">{customer.name}</td><td className="py-3"><a href={`tel:${customer.phone}`} className="text-[var(--emerald-deep)] hover:underline">{customer.phone}</a></td><td className="py-3">{customer.orders.length}</td><td className="py-3 font-semibold text-[var(--emerald-deep)]">{rupees(customer.spent)}</td><td className="py-3 text-muted-foreground">{new Date(customer.lastOrder.createdAt).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5"><Icon className="h-4 w-4 text-[var(--brass)]" /><p className="mt-3 font-serif text-3xl italic text-[var(--emerald-deep)]">{value}</p><p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>; }
function ExportButton({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]"><Download className="h-3.5 w-3.5" />{label}</button>; }
