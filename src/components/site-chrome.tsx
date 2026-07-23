import { Link } from "@tanstack/react-router";
import { ShoppingBag, MapPin, Phone, Clock, Instagram, Facebook, Menu, X, MessageCircle, UserRound, Crown, House, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/ratna-logo.png";
import { useCart } from "@/lib/cart";
import { RESTAURANT } from "@/data/menu";

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [customerSignedIn, setCustomerSignedIn] = useState(false);
  const [ownerSignedIn, setOwnerSignedIn] = useState(false);
  useEffect(() => {
    const syncSessions = () => {
      setCustomerSignedIn(Boolean(sessionStorage.getItem("ratna_customer_session_v2")));
      setOwnerSignedIn(Boolean(sessionStorage.getItem("ratna_owner_credentials")) || document.cookie.split(";").some((item) => item.trim() === "ratna_owner_session_v1=1"));
    };
    syncSessions();
    window.addEventListener("storage", syncSessions);
    window.addEventListener("ratna-session-changed", syncSessions);
    return () => { window.removeEventListener("storage", syncSessions); window.removeEventListener("ratna-session-changed", syncSessions); };
  }, []);
  return (
    <>
      <div className="bg-[var(--emerald)] text-[var(--ivory)]/90 text-[11px] tracking-[0.2em] uppercase">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-8">
          <span className="hidden md:inline">Est. {RESTAURANT.established} · {new Date().getFullYear() - RESTAURANT.established}+ years serving Hyderabad</span>
          <div className="flex items-center gap-5">
            <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-[var(--brass)]"><Phone className="h-3 w-3" />{RESTAURANT.phoneShort}</a>
            <span className="hidden sm:inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />12 PM – 11:30 PM</span>
          </div>
        </div>
      </div>
      <nav className="sticky top-0 z-50 border-b border-[var(--brass)]/25 bg-[var(--ivory)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Ratna" className="h-12 w-12" />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-2xl italic text-[var(--emerald-deep)]">Ratna</span>
              <span className="mt-1 text-[9px] font-semibold tracking-[0.32em] text-foreground/60">MULTI-CUISINE · SINCE 2004</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/reserve">Reserve</NavLink>
            <NavLink to="/corporate">Celebrate</NavLink>
            <NavLink to="/visit">Visit</NavLink>
            {ownerSignedIn ? <Link to="/owner" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--emerald-deep)] px-3 py-2 text-sm font-semibold text-[var(--ivory)]"><Crown className="h-3.5 w-3.5 text-[var(--brass)]" />Babu · Owner</Link> : <Link to="/account" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/25 px-3 py-2 text-sm font-semibold text-[var(--emerald-deep)]"><UserRound className="h-3.5 w-3.5" />{customerSignedIn ? "Account" : "Sign in"}</Link>}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-[var(--ivory)] shadow-sm transition hover:bg-[var(--emerald-deep)]">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Order</span>
              {count > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--brass)] px-1 text-[11px] font-bold text-[var(--emerald-deep)]">{count}</span>
              )}
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-border lg:hidden" aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-[var(--ivory)] px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              <MobileLink to="/" onClick={() => setOpen(false)}>Home</MobileLink>
              <MobileLink to="/menu" onClick={() => setOpen(false)}>Menu</MobileLink>
              <MobileLink to="/reserve" onClick={() => setOpen(false)}>Reserve a Table</MobileLink>
              <MobileLink to="/corporate" onClick={() => setOpen(false)}>Celebrations & Gatherings</MobileLink>
              <MobileLink to="/visit" onClick={() => setOpen(false)}>Visit Us</MobileLink>
              <MobileLink to={ownerSignedIn ? "/owner" : "/account"} onClick={() => setOpen(false)}>{ownerSignedIn ? "Babu · Owner" : customerSignedIn ? "Account" : "Sign in"}</MobileLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export function WhatsAppFloat() {
  const num = "919398604302";
  const msg = encodeURIComponent("Hi Ratna! I'd like to pre-order / reserve a table.");
  return (
    <a
      href={`https://wa.me/${num}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="WhatsApp Ratna"
      className="fixed bottom-24 right-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-[#25D366]/20 transition hover:scale-105 hover:bg-[#1ebe57] lg:bottom-5 lg:right-5"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}

export function MobileQuickNav() {
  const { count } = useCart();
  return <nav aria-label="Quick navigation" className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--brass)]/25 bg-[var(--ivory)]/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,.08)] backdrop-blur lg:hidden"><Quick to="/" label="Home" icon={<House className="h-4 w-4" />} /><Quick to="/menu" label="Menu" icon={<Utensils className="h-4 w-4" />} /><Quick to="/cart" label={count ? `Order ${count}` : "Order"} icon={<ShoppingBag className="h-4 w-4" />} /><Quick to="/account" label="Account" icon={<UserRound className="h-4 w-4" />} /></nav>;
}
function Quick({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) { return <Link to={to} className="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--emerald-deep)]">{icon}<span>{label}</span></Link>; }

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium tracking-wide text-foreground/75 transition hover:text-[var(--emerald-deep)]" activeProps={{ className: "text-[var(--emerald-deep)]" }} activeOptions={to === "/" ? { exact: true } : undefined}>
      {children}
    </Link>
  );
}
function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return <Link to={to} onClick={onClick} className="rounded-lg px-3 py-2 text-base font-medium hover:bg-secondary">{children}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--emerald-deep)] px-6 py-16 text-[var(--ivory)] md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Ratna" className="h-14 w-14" />
            <div>
              <p className="font-serif text-3xl italic">Ratna</p>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-[var(--brass)]">MULTI-CUISINE · SINCE 2004</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--ivory)]/70">
            Two decades of Hyderabadi hospitality — dum biryani from the copper handi, tandoor-fired kebabs, silky curries and warm sweets. Under one roof, all seven days.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brass)]/40 hover:bg-[var(--brass)]/10"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brass)]/40 hover:bg-[var(--brass)]/10"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h5 className="eyebrow mb-5 text-[var(--brass)]">Visit</h5>
          <p className="text-sm leading-relaxed text-[var(--ivory)]/75">{RESTAURANT.address}</p>
          <p className="mt-3 flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-[var(--brass)]" /> {RESTAURANT.hours}</p>
        </div>
        <div>
          <h5 className="eyebrow mb-5 text-[var(--brass)]">Reserve · Order</h5>
          <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="block font-serif text-2xl italic hover:text-[var(--brass)]">{RESTAURANT.phoneShort}</a>
          <p className="mt-2 text-sm text-[var(--ivory)]/70">reservations@ratnadeluxe.in</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-[var(--brass)]/20 pt-6">
        <h5 className="eyebrow mb-3 text-[var(--brass)]">Delivery Zones</h5>
        <div className="flex flex-wrap gap-2">
          {["Kushaiguda", "ECIL", "Dammaiguda", "Cherlapalli", "Kapra", "Nagaram", "AS Rao Nagar", "Sainikpuri"].map((z) => (
            <span key={z} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brass)]/30 px-3 py-1 text-xs text-[var(--ivory)]/80">
              <MapPin className="h-3 w-3 text-[var(--brass)]" />{z}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-[var(--brass)]/20 pt-6 text-[10px] uppercase tracking-[0.3em] text-[var(--ivory)]/40 md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Ratna Deluxe · All rights reserved</p>
        <p>Chakripuram · Kushaiguda · Hyderabad</p>
      </div>
    </footer>
  );
}
