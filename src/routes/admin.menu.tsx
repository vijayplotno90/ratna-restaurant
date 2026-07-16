import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { menuItems, categories, dishUrl } from "@/data/menu";
import { useOverrides } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/menu")({ component: MenuAdmin });

function MenuAdmin() {
  const ov = useOverrides();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const rows = useMemo(() => {
    let list = menuItems;
    if (cat !== "all") list = list.filter((m) => m.category === cat);
    if (q.trim()) list = list.filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()));
    return list;
  }, [q, cat]);

  const eightySixed = Object.entries(ov.map).filter(([, v]) => v.available === false).length;
  const priceEdits = Object.entries(ov.map).filter(([, v]) => v.priceOverride != null).length;

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Header title="Menu Manager" sub={`${menuItems.length} dishes · ${eightySixed} unavailable · ${priceEdits} custom prices`} />

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[var(--emerald)]" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full border border-border bg-white px-4 py-2 text-sm">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button onClick={() => { ov.reset(); toast("Overrides cleared"); }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary">
          <RotateCcw className="h-3 w-3" /> Reset overrides
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-[var(--brass)]/25 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--emerald-deep)] text-[var(--ivory)]">
            <tr className="text-left text-[10px] uppercase tracking-widest">
              <th className="px-4 py-3">Dish</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Base ₹</th><th className="px-4 py-3">Override ₹</th><th className="px-4 py-3 text-center">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((m) => {
              const o = ov.map[m.id];
              const available = o?.available !== false;
              return (
                <tr key={m.id} className={available ? "" : "bg-red-50/40"}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img src={dishUrl(m.image)} alt={m.name} className="h-10 w-10 rounded-sm object-cover" loading="lazy" />
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">{m.veg ? "Veg" : "Non-veg"}{m.chefPick ? " · Chef's pick" : ""}{m.popular ? " · Popular" : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{categories.find((c) => c.id === m.category)?.title ?? m.category}</td>
                  <td className="px-4 py-2">₹{m.price}</td>
                  <td className="px-4 py-2">
                    <input type="number" min={0} value={o?.priceOverride ?? ""} placeholder="—"
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        if (v === "") ov.set(m.id, { priceOverride: undefined });
                        else ov.set(m.id, { priceOverride: Math.max(0, Number(v)) });
                      }}
                      className="w-24 rounded-sm border border-border bg-white px-2 py-1 text-sm" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => ov.set(m.id, { available: !available })}
                      className={`relative h-6 w-11 rounded-full transition ${available ? "bg-[var(--emerald)]" : "bg-neutral-300"}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${available ? "left-5" : "left-0.5"}`} />
                    </button>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{available ? "Live" : "86'd"}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
