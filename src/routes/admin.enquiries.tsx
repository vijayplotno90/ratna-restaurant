import { createFileRoute } from "@tanstack/react-router";
import { Phone, Check, Archive, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { useEnquiries, type Enquiry } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/enquiries")({ component: EnqPage });

function EnqPage() {
  const { list, update } = useEnquiries();
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <Header title="Enquiries" sub={`${list.filter((e) => e.status === "unread").length} unread · ${list.length} total`} />
      <div className="mt-6 space-y-3">
        {list.length === 0 && <p className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No enquiries yet. When visitors send messages from /visit they'll appear here.</p>}
        {list.map((e) => (
          <div key={e.id} className={`rounded-sm border p-4 ${e.status === "unread" ? "border-[var(--emerald)] bg-[var(--emerald)]/5" : "border-[var(--brass)]/25 bg-white"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{e.name} <span className="ml-2 text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString("en-IN")}</span></p>
                <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 text-sm text-[var(--emerald-deep)]"><Phone className="h-3 w-3" />{e.phone}</a>
                <p className="mt-2 whitespace-pre-wrap text-sm">{e.message}</p>
              </div>
              <StatusTag s={e.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {e.status === "unread" && <Btn onClick={() => { update(e.id, { status: "read" }); toast.success("Marked read"); }}><MailOpen className="h-3 w-3" />Mark read</Btn>}
              {e.status !== "replied" && <Btn onClick={() => { update(e.id, { status: "replied" }); toast.success("Marked replied"); }}><Check className="h-3 w-3" />Mark replied</Btn>}
              {e.status !== "archived" && <Btn onClick={() => { update(e.id, { status: "archived" }); }}><Archive className="h-3 w-3" />Archive</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-widest hover:border-[var(--emerald)]">{children}</button>;
}
function StatusTag({ s }: { s: Enquiry["status"] }) {
  const map = { unread: "bg-[var(--emerald)] text-white", read: "bg-neutral-200 text-neutral-700", replied: "bg-blue-100 text-blue-800", archived: "bg-neutral-100 text-neutral-500" };
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${map[s]}`}>{s}</span>;
}
