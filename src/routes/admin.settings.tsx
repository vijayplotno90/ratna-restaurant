import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/admin-store";
import { Header } from "./admin.index";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const { value, set } = useSettings();
  const [hours, setHours] = useState(value.hours);
  const [radius, setRadius] = useState(value.deliveryRadiusKm);
  const [pass, setPass] = useState(value.adminPass);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Header title="Restaurant settings" sub="Applies to public site behaviour" />

      <section className="mt-6 space-y-6">
        <Card title="Kitchen">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Kitchen {value.kitchenPaused ? "paused" : "running"}</p>
              <p className="text-xs text-muted-foreground">When paused, the public site stops accepting online orders.</p>
            </div>
            <button onClick={() => { set({ kitchenPaused: !value.kitchenPaused }); toast.success(value.kitchenPaused ? "Kitchen resumed" : "Kitchen paused"); }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white ${value.kitchenPaused ? "bg-[var(--emerald-deep)]" : "bg-red-600"}`}>
              {value.kitchenPaused ? <><Play className="h-3 w-3" />Resume</> : <><Pause className="h-3 w-3" />Pause</>}
            </button>
          </div>
        </Card>

        <Card title="Delivery">
          <Field label="Delivery radius (km)">
            <input type="number" min={1} max={30} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
              className="w-32 rounded-sm border border-border bg-white p-2 text-sm" />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">Used by the checkout radius check and the MCP delivery tool.</p>
        </Card>

        <Card title="Hours">
          <Field label="Displayed hours">
            <input value={hours} onChange={(e) => setHours(e.target.value)} className="w-full rounded-sm border border-border bg-white p-2 text-sm" />
          </Field>
        </Card>

        <Card title="Admin passphrase">
          <Field label="Passphrase for /admin login">
            <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full rounded-sm border border-border bg-white p-2 text-sm" />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">Change this from the default. Shared by all staff who log in.</p>
        </Card>

        <button onClick={() => { set({ hours, deliveryRadiusKm: radius, adminPass: pass }); toast.success("Settings saved"); }}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--ivory)] hover:bg-[var(--emerald)]">
          <Save className="h-3.5 w-3.5" /> Save changes
        </button>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--brass)]/25 bg-white p-5">
      <h3 className="mb-3 font-serif text-lg">{title}</h3>{children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>{children}</label>;
}
