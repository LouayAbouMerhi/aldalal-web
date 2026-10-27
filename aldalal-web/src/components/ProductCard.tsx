"use client";

import Link from "next/link";
import { memo, ViewTransition, type ReactNode } from "react";
import { formatPrice, type Product } from "@/lib/catalog";
import { cart } from "@/lib/cart";
import { favorites } from "@/lib/favorites";
import { useReveal, useTilt } from "@/lib/hooks";
import { toast } from "@/lib/toast";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";
import { HeartIcon, PlusIcon } from "./icons";

type Props = {
  product: Product;
  qty: number;
  favorite: boolean;
  categoryName?: string;
  eager?: boolean;
  index?: number;
  /** Cards inside a horizontal rail get a fixed width. */
  rail?: boolean;
};

/**
 * Names the photo so it morphs into the product page.
 * Only the main grids use it: a name may exist once on the page, and rails can
 * repeat a product that is already shown somewhere else.
 */
function MorphPhoto({ id, enabled, children }: { id: string; enabled: boolean; children: ReactNode }) {
  if (!enabled) return <>{children}</>;
  return (
    <ViewTransition name={`product-${id}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

export function Price({ price, className = "" }: { price: number | null; className?: string }) {
  if (price === null) {
    return (
      <span className={`font-sans text-[11px] font-semibold tracking-[0.14em] text-gold-700 uppercase ${className}`}>
        Ask for price
      </span>
    );
  }
  return <span className={`font-display text-ink ${className}`}>{formatPrice(price)}</span>;
}

export function FavoriteButton({
  product,
  favorite,
  className = "",
  style,
}: {
  product: Product;
  favorite: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      style={style}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favorites.toggle(product.id);
        toast({
          title: favorite ? "Removed from saved" : "Saved for later",
          description: product.name,
          image: product.image?.src ?? null,
        });
      }}
      aria-pressed={favorite}
      aria-label={favorite ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      className={`grid size-9 place-items-center rounded-full backdrop-blur transition active:scale-90 ${
        favorite ? "bg-wine-50 text-wine-600" : "bg-surface/80 text-muted/50 hover:text-wine-600"
      } ${className}`}
    >
      <HeartIcon filled={favorite} width={17} height={17} />
    </button>
  );
}

export const ProductCard = memo(function ProductCard({
  product,
  qty,
  favorite,
  categoryName,
  eager,
  index = 0,
  rail = false,
}: Props) {
  const reveal = useReveal<HTMLElement>();
  const { ref: tiltRef, tiltProps } = useTilt<HTMLDivElement>(6);

  return (
    <article
      ref={reveal}
      data-reveal
      style={{ "--reveal-delay": `${Math.min(index, 9) * 55}ms` } as React.CSSProperties}
      className={`scene ${rail ? "w-[13rem] shrink-0 snap-start sm:w-[14.5rem]" : "card-shell"}`}
    >
      <div
        ref={tiltRef}
        {...tiltProps}
        className="group/card tilt relative flex h-full flex-col bg-surface ring-1 ring-line transition hover:shadow-[0_30px_50px_-32px_rgb(36_30_26/0.55)] hover:ring-gold-300"
      >
        <Link
          href={`/product/${product.id}`}
          className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-wine-600"
        >
          <div className="relative overflow-hidden bg-surface">
            <MorphPhoto id={product.id} enabled={!rail}>
              <ProductImage
                product={product}
                eager={eager}
                sizes="(min-width: 1280px) 260px, (min-width: 640px) 30vw, 45vw"
                className="tilt-layer transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:scale-[1.05]"
              />
            </MorphPhoto>
            <span className="tilt-sheen" />
          </div>

          <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
            {categoryName && <span className="eyebrow text-[10px]">{categoryName}</span>}
            <h3 className="font-display line-clamp-3 text-[15px] leading-snug text-ink" title={product.name}>
              {product.name}
            </h3>
          </div>
        </Link>

        <div className="mx-4 mt-4 border-t border-line-soft" />
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Price price={product.price} className="text-lg" />
          {qty > 0 ? (
            <QtyStepper size="sm" value={qty} label={product.name} onChange={(q) => cart.setQty(product.id, q)} />
          ) : (
            <button
              type="button"
              onClick={() => {
                cart.add(product.id);
                toast({
                  title: "Added to your order",
                  description: product.name,
                  image: product.image?.src ?? null,
                  action: { label: "View", onClick: () => window.dispatchEvent(new CustomEvent("aldalal:open-cart")) },
                });
              }}
              className="group/add inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-wine-600 uppercase transition hover:text-wine-700"
              aria-label={`Add ${product.name} to cart`}
            >
              <PlusIcon width={13} height={13} />
              <span className="border-b border-wine-600/40 pb-0.5 transition group-hover/add:border-wine-600">Add</span>
            </button>
          )}
        </div>

        <FavoriteButton
          product={product}
          favorite={favorite}
          style={{ "--depth": "60px" } as React.CSSProperties}
          className="tilt-layer absolute top-3 right-3 z-10 opacity-0 transition group-hover/card:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
        />
      </div>
    </article>
  );
});
