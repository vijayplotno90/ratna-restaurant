import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Lock, LogIn, RefreshCw, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { ratnaOwnerLogin, ratnaOwnerOverview } from "@/lib/ratna-console.functions";

export const Route = createFileRoute("/owner")({ component: OwnerConsole });

type Credentials = { userId: string; password: string };

function OwnerConsole() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof ratnaOwnerOverview>> | null>(null);

  const signIn = async (input: Credentials) => {
    setBusy(true);
    setError("");
    try {
      await ratnaOwnerLogin({ data: input });
      const overview = await ratnaOwnerOverview({ data: input });
      setCredentials(input);
      setData(overview);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    if (!credentials) return;
    setBusy(true);
    setError("");
    try {
      setData(await ratnaOwnerOverview({ data: credentials }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to refresh");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="public-page min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        {!credentials ? (
          <OwnerLogin busy={busy} error={error} onSignIn={signIn} />
        ) : (
          <Dashboard
            data={data}
            busy={busy}
            error={error}
            onRefresh={refresh}
            onSignOut={() => {
              setCredentials(null);
              setData(null);
            }}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function OwnerLogin({
  busy,
  error,
  onSignIn,
}: {
  busy: boolean;
  error: string;
  onSignIn: (input: Credentials) => Promise<void>;
}) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  return (
    <section className="mx-auto max-w-md rounded-sm border border-[var(--brass)]/30 bg-white p-7 shadow-sm">
      <Crown className="h-7 w-7 text-[var(--brass)]" />
      <p className="mt-5 eyebrow text-[var(--brass)]">Ratna Owner</p>
      <h1 className="mt-2 font-serif text-4xl italic text-[var(--emerald-deep)]">Owner console</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Finance, customer relationships, campaigns and audit-ready operations.
      </p>
      {error && <p className="mt-4 rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSignIn({ userId, password });
        }}
        className="mt-6 space-y-3"
      >
        <input
          required
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Owner user ID"
          className="w-full rounded-sm border border-border p-3 text-sm"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-sm border border-border p-3 text-sm"
        />
        <button
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--emerald-deep)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--ivory)] disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 flex gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--emerald)]" />
        Demo owner credentials are created by the Ratna database migration. Replace them before real
        staff access.
      </p>
    </section>
  );
}

function Dashboard({
  data,
  busy,
  error,
  onRefresh,
  onSignOut,
}: {
  data: Awaited<ReturnType<typeof ratnaOwnerOverview>> | null;
  busy: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onSignOut: () => void;
}) {
  const orders = data?.orders ?? [];
  const active = orders.filter((order) => order.status !== "cancelled");
  const sales = active.reduce((total, order) => total + Number(order.total), 0);
  const gst = active.reduce((total, order) => total + Number(order.gst_amount), 0);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--brass)]/25 pb-6">
        <div>
          <p className="eyebrow text-[var(--brass)]">Ratna Owner</p>
          <h1 className="mt-2 font-serif text-4xl italic text-[var(--emerald-deep)]">
            Business control room
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {data?.user.name}. Data is stored in Ratna Supabase.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void onRefresh()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={onSignOut}
            className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Sign out
          </button>
        </div>
      </div>
      {error && <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={WalletCards}
          label="Recorded sales"
          value={`₹${sales.toLocaleString("en-IN")}`}
        />
        <Metric
          icon={UsersRound}
          label="Known customers"
          value={String(data?.profiles.length ?? 0)}
        />
        <Metric icon={Lock} label="GST collected" value={`₹${gst.toLocaleString("en-IN")}`} />
      </section>
      <section className="mt-7 rounded-sm border border-[var(--brass)]/25 bg-white p-6">
        <p className="eyebrow text-[var(--brass)]">Live operations</p>
        <h2 className="mt-2 font-serif text-2xl italic text-[var(--emerald-deep)]">
          Orders and campaigns
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {orders.length} stored orders · {data?.campaigns.length ?? 0} configured campaigns. The
          next migration phase connects checkout, staff workflow and campaign delivery to these
          records.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--ivory)]"
          >
            Open admin workspace
          </Link>
          <Link
            to="/account"
            className="rounded-full border border-[var(--emerald)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]"
          >
            Customer account
          </Link>
        </div>
      </section>
    </>
  );
}

function Metric({
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
