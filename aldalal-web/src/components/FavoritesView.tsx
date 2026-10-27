"use client";

import Link from "next/link";
import { categoryById, formatPrice } from "@/lib/catalog";
import { cart, useCart } from "@/lib/cart";
import { favorites, useFavoriteProducts } from "@/lib/favorites";
import { toast } from "@/lib/toast";
import { ProductCard } from "./ProductCard";
import { RecentlyViewed } from "./HomeSections";
import { ArrowRightIcon, CartIcon, HeartIcon, TrashIcon } from "./icons";

export function FavoritesView() {
  const items = useFavoriteProducts();
  const cartState = useCart();
  const total = items.reduce((sum, p) => sum + (p.price ?? 0), 0);

  return (
    <>
      <section className="border-b border-line bg-surface py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="enter flex items-center gap-4 text-[clamp(2rem,4vw,3rem)] text-ink">
            <HeartIcon filled className="size-7 text-wine-600 md:size-8" />
            Saved products
          </h1>
          <p className="mt-4 text-[13px] tracking-wide text-muted">
            {items.length === 0
              ? "Tap the heart on any product to keep it here."
              : `${items.length} saved · ${formatPrice(total)} if you take one of each`}
          </p>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-20 text-center">
          <span className="grid size-20 place-items-center border border-line text-wine-600/60">
            <HeartIcon width={34} height={34} />
          </span>
          <h2 className="font-display text-2xl">Nothing saved yet</h2>
          <p className="text-sm text-muted">
            Browse the catalog and tap the heart on a product to save it for later. Saved products stay on this device.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex h-12 items-center gap-2 bg-ink px-7 text-[12px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-wine-600"
          >
            Browse products
            <ArrowRightIcon />
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                items.forEach((p) => cart.add(p.id));
                toast({ title: `${items.length} products added to your order` });
              }}
              className="inline-flex h-11 items-center gap-2 bg-ink px-6 text-[11px] font-semibold tracking-[0.16em] text-paper uppercase transition hover:bg-wine-600"
            >
              <CartIcon width={18} height={18} />
              Add all to order
            </button>
            <button
              type="button"
              onClick={() => {
                favorites.clear();
                toast({ title: "Saved products cleared" });
              }}
              className="inline-flex h-11 items-center gap-2 border border-line px-6 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase transition hover:border-wine-600/40 hover:text-wine-600"
            >
              <TrashIcon width={18} height={18} />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                qty={cartState[p.id] ?? 0}
                favorite
                categoryName={categoryById.get(p.category)?.name}
              />
            ))}
          </div>
        </div>
      )}

      <RecentlyViewed />
    </>
  );
}
