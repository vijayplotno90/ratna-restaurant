import { Link } from "@tanstack/react-router";
import { ShoppingBag, MapPin, Phone, Clock, Instagram, Facebook, Menu, X, MessageCircle, UserRound } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/ratna-logo.png";
import { useCart } from "@/lib/cart";
import { RESTAURANT } from "@/data/menu";

export function SiteNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
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

          <div className="hidden items-center gap-9 md:flex">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/reserve">Reserve</NavLink>
            <NavLink to="/corporate">Corporate</NavLink>
            <NavLink to="/visit">Visit</NavLink>
            <Link to="/account" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/25 px-3 py-2 text-sm font-semibold text-[var(--emerald-deep)]"><UserRound className="h-3.5 w-3.5" />Sign in</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-[var(--ivory)] shadow-sm transition hover:bg-[var(--emerald-deep)]">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Order</span>
              {count > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--brass)] px-1 text-[11px] font-bold text-[var(--emerald-deep)]">{count}</span>
              )}
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden" aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-[var(--ivory)] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <MobileLink to="/" onClick={() => setOpen(false)}>Home</MobileLink>
              <MobileLink to="/menu" onClick={() => setOpen(false)}>Menu</MobileLink>
              <MobileLink to="/reserve" onClick={() => setOpen(false)}>Reserve a Table</MobileLink>
              <MobileLink to="/corporate" onClick={() => setOpen(false)}>Corporate & Team Lunches</MobileLink>
              <MobileLink to="/visit" onClick={() => setOpen(false)}>Visit Us</MobileLink>
              <MobileLink to="/account" onClick={() => setOpen(false)}>Sign in</MobileLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export function WhatsAppFloat() {
  const num = RESTAURANT.phone.replace(/[^0-9]/g, "");
  const msg = encodeURIComponent("Hi Ratna! I'd like to pre-order / reserve a table.");
  return (
    <a
      href={`https://wa.me/${num}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-xl ring-4 ring-[#25D366]/20 transition hover:scale-105 hover:bg-[#1ebe57]"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
}

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
