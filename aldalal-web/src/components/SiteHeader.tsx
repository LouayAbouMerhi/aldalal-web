"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/catalog";
import { useScrolled } from "@/lib/hooks";
import { CartIcon, HeartIcon, SearchIcon } from "./icons";

const NAV = [
  { href: "/", label: "Maison" },
  { href: "/products", label: "Catalogue" },
  { href: "/favorites", label: "Saved" },
];

type Props = {
  cartPieces: number;
  cartSubtotal: number;
  favoriteCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
};

export function SiteHeader({ cartPieces, cartSubtotal, favoriteCount, onOpenCart, onOpenSearch }: Props) {
  const scrolled = useScrolled(12);
  const pathname = usePathname();

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur transition-shadow duration-500 ${
        scrolled ? "shadow-[0_10px_30px_-24px_rgb(36_30_26/0.6)]" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-8 lg:h-[4.75rem] lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.fullName} – home`}>
          <Image src="/logo.png" alt="" width={40} height={40} preload className="size-9 rounded-sm ring-1 ring-line lg:size-10" />
          <span className="leading-none">
            <span className="font-display block text-[19px] tracking-[0.18em] text-ink lg:text-[21px]">{site.name}</span>
            <span className="mt-1.5 hidden text-[9px] font-medium tracking-[0.34em] text-muted uppercase sm:block">
              For General Trading
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-[12px] font-semibold tracking-[0.16em] uppercase transition ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold-500 transition-transform duration-500 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-10 flex-1 items-center gap-2 border border-line bg-surface px-4 text-left text-[13px] text-muted transition hover:border-gold-300 sm:max-w-[16rem]"
            aria-label="Search products"
          >
            <SearchIcon width={16} height={16} className="shrink-0 text-gold-500" />
            <span className="hidden truncate sm:block">Search the catalogue…</span>
            <kbd className="ml-auto hidden border border-line px-1.5 text-[10px] lg:block">/</kbd>
          </button>

          <Link
            href="/favorites"
            className="relative hidden size-10 shrink-0 place-items-center border border-line text-muted transition hover:border-wine-600/40 hover:text-wine-600 lg:grid"
            aria-label={`Saved products, ${favoriteCount} saved`}
          >
            <HeartIcon filled={favoriteCount > 0} className={favoriteCount > 0 ? "text-wine-600" : ""} />
            {favoriteCount > 0 && (
              <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-wine-600 px-1 text-[10px] font-bold text-paper tabular-nums">
                {favoriteCount > 99 ? "99+" : favoriteCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-10 shrink-0 items-center gap-2 bg-wine-600 px-4 text-[12px] font-semibold tracking-[0.14em] text-paper uppercase transition hover:bg-wine-700 active:scale-95 lg:px-5"
            aria-label={`Open cart, ${cartPieces} ${cartPieces === 1 ? "item" : "items"}`}
          >
            <CartIcon width={17} height={17} />
            <span className="hidden tabular-nums lg:inline">{cartPieces > 0 ? formatPrice(cartSubtotal) : "Order"}</span>
            {cartPieces > 0 && (
              <span
                key={cartPieces}
                className="badge-pop absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink tabular-nums"
              >
                {cartPieces > 99 ? "99+" : cartPieces}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
