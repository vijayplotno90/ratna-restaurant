import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Bike,
  UtensilsCrossed,
  Inbox,
  Settings as SettingsIcon,
  LogOut,
  Store,
  Crown,
  Menu,
  X,
} from "lucide-react";
import {
  useAdminAuth,
  useEnquiries,
  useOrders,
  useReservations,
  useSettings,
} from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Ratna Deluxe" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const auth = useAdminAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ownerSession, setOwnerSession] = useState(false);

  useEffect(() => { setOwnerSession(document.cookie.split(";").some(item => item.trim() === "ratna_owner_session_v1=1")); }, []);

  useEffect(() => {
    if (auth.hydrated && !auth.unlocked && pathname !== "/admin/login") {
      nav({ to: "/admin/login" });
    }
  }, [auth.hydrated, auth.unlocked, pathname, nav]);

  if (pathname === "/admin/login") return <Outlet />;
  if (!auth.hydrated || !auth.unlocked) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--ivory)] text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)] text-foreground">
      <div className="sticky top-0 z-40 flex items-center justify-between bg-[var(--emerald-deep)] px-4 py-3 text-[var(--ivory)] md:hidden">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--brass)]">
            Admin Console
          </p>
          <p className="font-serif text-xl italic">Ratna</p>
        </div>
        <button
          onClick={() => setMobileNavOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/20"
          aria-label="Toggle admin navigation"
        >
          {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
          onLogout={() => {
            auth.lock();
            nav({ to: "/admin/login" });
          }}
          ownerSession={ownerSession}
        />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  onLogout,
  mobileOpen,
  onNavigate,
  ownerSession,
}: {
  onLogout: () => void;
  mobileOpen: boolean;
  onNavigate: () => void;
  ownerSession: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const r = useReservations();
  const o = useOrders();
  const e = useEnquiries();
  const s = useSettings();

  const pendingRes = r.list.filter((x) => x.status === "pending").length;
  const liveOrders = o.list.filter((x) => !["delivered", "cancelled"].includes(x.status)).length;
  const unreadEnq = e.list.filter((x) => x.status === "unread").length;

  const items = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, badge: 0, exact: true },
    { to: "/admin/reservations", label: "Reservations", icon: CalendarCheck, badge: pendingRes },
    { to: "/admin/orders", label: "Orders & Delivery", icon: Bike, badge: liveOrders },
    { to: "/admin/menu", label: "Menu Manager", icon: UtensilsCrossed, badge: 0 },
    { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: unreadEnq },
    { to: "/admin/settings", label: "Settings", icon: SettingsIcon, badge: 0 },
  ];

  return (
    <aside
      className={`${mobileOpen ? "fixed inset-x-0 top-[64px] bottom-0 z-30" : "hidden"} flex h-[calc(100vh-64px)] w-full shrink-0 flex-col bg-[var(--emerald-deep)] text-[var(--ivory)] md:sticky md:top-0 md:flex md:h-screen md:w-64`}
    >
      <div className="px-6 pt-6 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brass)]">
          Admin Console
        </p>
        <h1 className="mt-1 font-serif text-3xl italic">Ratna</h1>
        <p className="text-[11px] text-[var(--ivory)]/60">Kushaiguda · Hyderabad</p>
        {s.value.kitchenPaused && (
          <p className="mt-3 rounded-sm bg-red-500/20 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-red-100">
            Kitchen paused
          </p>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={`group flex items-center justify-between rounded-sm px-3 py-2.5 text-sm transition ${active ? "bg-[var(--brass)] text-[var(--emerald-deep)]" : "text-[var(--ivory)]/85 hover:bg-white/10"}`}
            >
              <span className="flex items-center gap-3">
                <it.icon className="h-4 w-4" />
                {it.label}
              </span>
              {it.badge > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-[var(--emerald-deep)] text-[var(--brass)]" : "bg-[var(--brass)] text-[var(--emerald-deep)]"}`}
                >
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 p-3">
        {ownerSession && <Link to="/owner" className="mb-1 flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-[var(--brass)] hover:bg-white/10"><Crown className="h-4 w-4" /> Owner Console</Link>}
        <Link
          to="/"
          className="mb-1 flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-[var(--ivory)]/70 hover:bg-white/10"
        >
          <Store className="h-4 w-4" /> View public site
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-[var(--ivory)]/70 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
