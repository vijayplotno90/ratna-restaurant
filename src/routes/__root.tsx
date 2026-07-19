import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import { MobileQuickNav, WhatsAppFloat } from "@/components/site-chrome";
import logo from "@/assets/ratna-logo.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ratna Deluxe — Multi-Cuisine Restaurant · Kushaiguda, Hyderabad" },
      { name: "description", content: "Ratna Deluxe: Hyderabad's beloved multi-cuisine restaurant since 2004. Dum biryani, tandoori, Indo-Chinese, sweets. Dine-in, takeaway, reservations & corporate lunches." },
      { name: "theme-color", content: "#164a37" },
      { property: "og:title", content: "Ratna Deluxe — Multi-Cuisine Restaurant" },
      { property: "og:description", content: "20+ years of Hyderabadi hospitality. Biryani, tandoori, Chinese, sweets — under one roof. Reserve a table or order online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: logo },
      { rel: "apple-touch-icon", href: logo },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <WhatsAppFloat />
        <MobileQuickNav />
        <PwaInstallPrompt />
        <Toaster position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}

function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onInstall = (event: Event) => { event.preventDefault(); setDeferred(event); setVisible(true); };
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as any).standalone;
    setIos(isIos); if (isIos) setVisible(true);
    window.addEventListener("beforeinstallprompt", onInstall as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", onInstall as EventListener);
  }, []);
  if (!visible) return null;
  const install = async () => { if (!deferred) return; await deferred.prompt(); setVisible(false); setDeferred(null); };
  return <aside className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-sm rounded-2xl border border-[var(--brass)]/35 bg-white p-4 shadow-2xl sm:left-auto"><button aria-label="Close install suggestion" onClick={() => setVisible(false)} className="absolute right-3 top-3 text-muted-foreground"><X className="h-4 w-4" /></button><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--emerald-deep)] text-[var(--brass)]"><Download className="h-5 w-5" /></span><div><b className="text-[var(--emerald-deep)]">Add Ratna to your phone</b><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ios ? "In Safari, tap Share, then Add to Home Screen. You can also continue using the website normally." : "Install the Ratna app for quicker ordering. The website works perfectly without installing."}</p>{deferred && <button onClick={() => void install()} className="mt-3 rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-xs font-bold text-white">Install app</button>}</div></div></aside>;
}
