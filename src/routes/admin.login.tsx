import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-store";
import { ratnaAdminLogin } from "@/lib/ratna-console.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin sign-in · Ratna" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const auth = useAdminAuth();
  const nav = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (auth.hydrated && auth.unlocked) nav({ to: "/admin/" });
  }, [auth.hydrated, auth.unlocked, nav]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await ratnaAdminLogin({ data: { userId, password } });
      auth.unlockVerified();
      toast.success("Welcome back");
      nav({ to: "/admin/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--emerald-deep)] px-4 text-[var(--ivory)]">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-sm border border-[var(--brass)]/30 bg-black/20 p-8"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--brass)]/20">
          <Lock className="h-6 w-6 text-[var(--brass)]" />
        </div>
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brass)]">
          Ratna Admin
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl italic">Sign in</h1>
        <p className="mt-2 text-center text-xs text-[var(--ivory)]/60">
          Staff console for reservations, orders and menu.
        </p>
        <label className="mt-6 block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)]/70">
            Admin user ID
          </span>
          <input
            required
            autoFocus
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-sm border border-white/20 bg-black/30 p-3 text-sm outline-none focus:border-[var(--brass)]"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[var(--ivory)]/70">
            Password
          </span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-sm border border-white/20 bg-black/30 p-3 text-sm outline-none focus:border-[var(--brass)]"
          />
        </label>
        <button
          disabled={busy}
          className="mt-5 w-full rounded-full bg-[var(--brass)] py-3 text-sm font-bold uppercase tracking-widest text-[var(--emerald-deep)] hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Enter"}
        </button>
        <p className="mt-4 text-center text-[10px] text-[var(--ivory)]/50">
          Demo: <code>admin_demo / 0000</code> — replace before live staff access.
        </p>
      </form>
    </div>
  );
}
