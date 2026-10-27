"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { summarize, useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { useScrollProgress } from "@/lib/hooks";
import { CartDrawer } from "./CartDrawer";
import { InstallPrompt } from "./InstallPrompt";
import { MobileNav } from "./MobileNav";
import { PhotoGuard } from "./PhotoGuard";
import { SearchOverlay } from "./SearchOverlay";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Toaster } from "./Toaster";
import { ArrowUpIcon } from "./icons";

/** Header, footer, cart, search and everything that lives on every page. */
export function AppChrome({ children }: { children: ReactNode }) {
  const cartState = useCart();
  const summary = useMemo(() => summarize(cartState), [cartState]);
  const favoriteCount = useFavorites().length;
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  // Open the cart from anywhere (used by the "Added to your order" toast)
  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("aldalal:open-cart", open);
    return () => window.removeEventListener("aldalal:open-cart", open);
  }, []);

  // "/" or Ctrl/Cmd+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey)) {
        if (document.querySelector("dialog[open]")) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Offline support + "add to home screen"
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const id = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <PhotoGuard />
      <SiteHeader
        cartPieces={summary.pieces}
        cartSubtotal={summary.subtotal}
        favoriteCount={favoriteCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <main id="main" className="min-h-[60vh] pb-24 lg:pb-0">
        {children}
      </main>
      <SiteFooter />

      <MobileNav
        cartPieces={summary.pieces}
        cartSubtotal={summary.subtotal}
        favoriteCount={favoriteCount}
        onOpenCart={() => setCartOpen(true)}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpenProduct={(id) => router.push(`/product/${id}`)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
      <InstallPrompt />
      <BackToTop />
    </>
  );
}

function BackToTop() {
  const progress = useScrollProgress();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  const r = 20;
  const circumference = 2 * Math.PI * r;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 bottom-28 z-30 grid size-12 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg transition hover:border-gold-400 hover:text-gold-700 lg:bottom-6"
      aria-label="Back to top"
    >
      <svg className="absolute inset-0 size-12 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="2" className="text-line" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-gold-500"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }}
        />
      </svg>
      <ArrowUpIcon width={18} height={18} />
    </button>
  );
}
