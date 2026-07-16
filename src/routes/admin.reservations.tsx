import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Phone, Snowflake, Check, X, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useReservations, type Reservation } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/reservations")({ component: ResPage });

const STATUS: Reservation["status"][] = ["pending", "confirmed", "seated", "no-show", "cancelled"];

function ResPage() {
  const { list, update } = useReservations();
  const [filter, setFilter] = useState<"all" | Reservation["status"]>("all");
  const [hall, setHall] = useState<"all" | "ratna" | "deluxe">("all");

  const rows = useMemo(() =>
    list.filter((r) => (filter === "all" || r.status === filter) && (hall === "all" || r.hall === hall))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  , [list, filter, hall]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Header title="Reservations" sub={`${list.length} total · ${list.filter((r) => r.status === "pending").length} awaiting confirmation`} />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {STATUS.map((s) => <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</Chip>)}
        <span className="mx-3 text-muted-foreground">·</span>
        <Chip active={hall === "all"} onClick={() => setHall("all")}>Both halls</Chip>
        <Chip active={hall === "ratna"} onClick={() => setHall("ratna")}>Ratna</Chip>
        <Chip active={hall === "deluxe"} onClick={() => setHall("deluxe")}>Deluxe</Chip>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-[var(--brass)]/25 bg-white">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No reservations match these filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--emerald-deep)] text-[var(--ivory)]">
              <tr className="text-left text-[10px] uppercase tracking-widest">
                <th className="px-4 py-3">Guest</th><th className="px-4 py-3">When</th><th className="px-4 py-3">Party</th><th className="px-4 py-3">Hall</th><th className="px-4 py-3">Table</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-xs text-[var(--emerald-deep)]"><Phone className="h-3 w-3" />{r.phone}</a>
                    {r.notes && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
                  </td>
                  <td className="px-4 py-3"><p className="font-semibold">{r.date}</p><p className="text-xs text-muted-foreground">{r.time}</p></td>
                  <td className="px-4 py-3">{r.guests} · <span className="text-xs text-muted-foreground">{r.seating}</span></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-deep)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-deep)]">
                      {r.hall === "deluxe" && <Snowflake className="h-3 w-3" />}{r.hallName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input value={r.table ?? ""} onChange={(e) => update(r.id, { table: e.target.value })} placeholder="—"
                      className="w-16 rounded-sm border border-border bg-white px-2 py-1 text-center text-sm" />
                  </td>
                  <td className="px-4 py-3"><StatusPill s={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {r.status === "pending" && <IconBtn title="Confirm" onClick={() => { update(r.id, { status: "confirmed" }); toast.success("Confirmed"); }}><Check className="h-3.5 w-3.5" /></IconBtn>}
                      {(r.status === "pending" || r.status === "confirmed") && <IconBtn title="Mark seated" onClick={() => { update(r.id, { status: "seated" }); toast.success("Seated"); }}><UserCheck className="h-3.5 w-3.5" /></IconBtn>}
                      {r.status !== "cancelled" && r.status !== "seated" && <IconBtn title="Cancel" onClick={() => { update(r.id, { status: "cancelled" }); toast("Cancelled — refund the ₹200 fee."); }}><X className="h-3.5 w-3.5" /></IconBtn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition ${active ? "bg-[var(--emerald-deep)] text-[var(--ivory)]" : "border border-border text-muted-foreground hover:border-[var(--emerald)]"}`}>{children}</button>;
}
function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return <button title={title} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-sm border border-border hover:border-[var(--emerald)] hover:bg-[var(--emerald)]/5">{children}</button>;
}
function StatusPill({ s }: { s: Reservation["status"] }) {
  const style: Record<Reservation["status"], string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    seated: "bg-green-100 text-green-800",
    "no-show": "bg-neutral-200 text-neutral-700",
    cancelled: "bg-red-100 text-red-800",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${style[s]}`}>{s}</span>;
}
