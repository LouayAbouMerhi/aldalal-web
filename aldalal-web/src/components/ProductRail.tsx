"use client";

import Link from "next/link";
import { useRef } from "react";
import { type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useFavoriteSet } from "@/lib/favorites";
import { useReveal } from "@/lib/hooks";
import { ProductCard } from "./ProductCard";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

type Props = {
  title: string;
  subtitle?: string;
  items: Product[];
  href?: string;
  icon?: React.ReactNode;
  tone?: "light" | "dark";
};

/** Horizontal, snapping row of product cards with arrows on desktop. */
export function ProductRail({ title, subtitle, items, href, icon, tone = "light" }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const cartState = useCart();
  const favoriteSet = useFavoriteSet();
  const reveal = useReveal<HTMLDivElement>();

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const box = scroller.current;
    if (!box) return;
    box.scrollBy({ left: dir * Math.max(240, box.clientWidth * 0.8), behavior: "smooth" });
  };

  const dark = tone === "dark";

  return (
    <section ref={reveal} data-reveal className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h2 className={`flex items-center gap-3 text-[1.7rem] ${dark ? "text-paper" : "text-ink"}`}>
            {icon}
            {title}
          </h2>
          {subtitle && <p className={`mt-2 text-[13px] tracking-wide ${dark ? "text-paper/70" : "text-muted"}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="hidden border-b border-gold-500/50 pb-1 text-[11px] font-semibold tracking-[0.18em] text-gold-700 uppercase transition hover:border-gold-700 sm:inline-flex"
            >
              See all
            </Link>
          )}
          <div className="hidden gap-1.5 lg:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="grid size-10 place-items-center border border-line bg-surface text-ink transition hover:border-gold-400 hover:text-gold-700"
              aria-label="Scroll left"
            >
              <ArrowLeftIcon width={18} height={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="grid size-10 place-items-center border border-line bg-surface text-ink transition hover:border-gold-400 hover:text-gold-700"
              aria-label="Scroll right"
            >
              <ArrowRightIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar -mx-4 -my-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 sm:gap-5"
      >
        {items.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            rail
            qty={cartState[p.id] ?? 0}
            favorite={favoriteSet.has(p.id)}
          />
        ))}
        {href && (
          <Link
            href={href}
            className="flex w-[13rem] shrink-0 snap-start flex-col items-center justify-center gap-3 border border-dashed border-line text-[11px] font-semibold tracking-[0.18em] text-gold-700 uppercase transition hover:border-gold-400 hover:bg-surface sm:w-[14.5rem]"
          >
            <ArrowRightIcon />
            See all
          </Link>
        )}
      </div>
    </section>
  );
}
