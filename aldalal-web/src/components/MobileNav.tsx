"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { formatPrice } from "@/lib/catalog";
import { CartIcon, GridIcon, HeartIcon, HomeIcon } from "./icons";

type Props = {
  cartPieces: number;
  cartSubtotal: number;
  favoriteCount: number;
  onOpenCart: () => void;
};

/** App-style bottom bar, phones and tablets only. */
export function MobileNav({ cartPieces, cartSubtotal, favoriteCount, onOpenCart }: Props) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: HomeIcon, active: pathname === "/" },
    { href: "/products", label: "Catalog", icon: GridIcon, active: pathname.startsWith("/product") },
    { href: "/favorites", label: "Saved", icon: HeartIcon, active: pathname.startsWith("/favorites"), badge: favoriteCount },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      {cartPieces > 0 && (
        <motion.button
          type="button"
          onClick={onOpenCart}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="mx-3 mb-2 flex h-12 w-[calc(100%-1.5rem)] items-center justify-between gap-3 bg-wine-600 px-4 text-paper shadow-[0_16px_30px_-18px_rgb(36_30_26/0.8)]"
        >
          <span className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] uppercase">
            <CartIcon width={18} height={18} />
            View order · {cartPieces} pcs
          </span>
          <span className="font-display text-base tabular-nums">{formatPrice(cartSubtotal)}</span>
        </motion.button>
      )}

      <nav
        aria-label="Main"
        className="flex items-stretch justify-around border-t border-line bg-paper/97 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase transition ${
              active ? "text-wine-600" : "text-muted"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="relative">
              <Icon width={22} height={22} />
              {!!badge && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-wine-600 px-1 text-[10px] font-bold text-paper tabular-nums">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            {label}
            {active && <motion.span layoutId="mobile-nav-dot" className="absolute -top-1.5 h-px w-10 bg-gold-500" />}
          </Link>
        ))}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase"
        >
          <span className="relative">
            <CartIcon width={22} height={22} />
            {cartPieces > 0 && (
              <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink tabular-nums">
                {cartPieces > 99 ? "99+" : cartPieces}
              </span>
            )}
          </span>
          Order
        </button>
      </nav>
    </div>
  );
}
