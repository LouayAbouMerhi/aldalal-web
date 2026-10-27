"use client";

import Link from "next/link";
import { useEffect, useState, ViewTransition } from "react";
import { site, whatsappDisplay } from "@/config/site";
import { categoryById, formatPrice, type Product } from "@/lib/catalog";
import { cart, useCart } from "@/lib/cart";
import { favorites, useFavoriteSet } from "@/lib/favorites";
import { useTilt } from "@/lib/hooks";
import { catalogHref } from "@/lib/links";
import { recent } from "@/lib/recent";
import { toast } from "@/lib/toast";
import { productQuestion, whatsappUrl } from "@/lib/whatsapp";
import { PhotoZoom } from "./PhotoZoom";
import { ProductImage } from "./ProductImage";
import { ProductRail } from "./ProductRail";
import { QtyStepper } from "./QtyStepper";
import { RecentlyViewed } from "./HomeSections";
import { ArrowLeftIcon, CartIcon, CheckIcon, HeartIcon, PhoneIcon, SearchIcon, ShareIcon, WhatsAppIcon } from "./icons";

export function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const qty = useCart()[product.id] ?? 0;
  const favorite = useFavoriteSet().has(product.id);
  const category = categoryById.get(product.category);
  const [pending, setPending] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { ref: tiltRef, tiltProps } = useTilt<HTMLDivElement>(9);

  useEffect(() => {
    recent.add(product.id);
  }, [product.id]);

  const add = () => {
    cart.add(product.id, pending);
    toast({
      title: `${pending} × added to your order`,
      description: product.name,
      image: product.image?.src ?? null,
      action: { label: "View", onClick: () => window.dispatchEvent(new CustomEvent("aldalal:open-cart")) },
    });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name}${product.price !== null ? ` — ${formatPrice(product.price)}` : ""}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: product.name });
    } catch {
      /* the customer cancelled the share sheet */
    }
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-line bg-surface">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase lg:px-8">
          <li>
            <Link href="/" className="transition hover:text-gold-700">
              Maison
            </Link>
          </li>
          <li aria-hidden className="text-line">/</li>
          <li>
            <Link href="/products" className="transition hover:text-gold-700">
              Catalogue
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden className="text-line">/</li>
              <li>
                <Link href={catalogHref({ cat: category.id })} className="transition hover:text-gold-700">
                  {category.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        {/* The piece on its pedestal */}
        <div className="scene-deep enter">
          <div ref={tiltRef} {...tiltProps} className="tilt relative aspect-[4/5] bg-surface ring-1 ring-line">
            <span className="pointer-events-none absolute inset-4 border border-line-soft" />

            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="tilt-layer absolute inset-8 cursor-zoom-in"
              style={{ "--depth": "50px" } as React.CSSProperties}
              aria-label={`Zoom into ${product.name}`}
            >
              <ViewTransition name={`product-${product.id}`} share="morph" default="none">
                <ProductImage
                  product={product}
                  eager
                  preload
                  large
                  sizes="(min-width: 1024px) 560px, 92vw"
                  className="float-product !bg-transparent"
                />
              </ViewTransition>
            </button>

            <span className="pedestal-shadow absolute bottom-10 left-1/2 h-8 w-1/2 -translate-x-1/2" />
            <span className="tilt-sheen" />

            <span style={{ "--depth": "70px" } as React.CSSProperties}
              className="tilt-layer pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-1.5 bg-surface/95 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              <SearchIcon width={13} height={13} />
              Tap to zoom
            </span>

            <button
              type="button"
              onClick={() => {
                favorites.toggle(product.id);
                toast({
                  title: favorite ? "Removed from saved" : "Saved for later",
                  description: product.name,
                  image: product.image?.src ?? null,
                });
              }}
              aria-pressed={favorite}
              style={{ "--depth": "70px" } as React.CSSProperties}
              className={`tilt-layer absolute top-5 right-5 z-10 grid size-11 place-items-center border transition active:scale-90 ${
                favorite ? "border-wine-600/40 bg-wine-50 text-wine-600" : "border-line bg-surface text-muted/60 hover:text-wine-600"
              }`}
              aria-label={favorite ? "Remove from saved" : "Save for later"}
            >
              <HeartIcon filled={favorite} />
            </button>
          </div>
        </div>

        {/* The description */}
        <div className="enter enter-1 flex flex-col">
          {category && (
            <Link href={catalogHref({ cat: category.id })} className="eyebrow w-fit transition hover:text-gold-500">
              {category.name}
            </Link>
          )}

          <h1 className="mt-5 text-[clamp(1.8rem,3.4vw,2.9rem)] leading-tight text-ink">{product.name}</h1>
          <div className="rule-gold my-7 w-16" />

          <div className="flex flex-wrap items-baseline gap-3">
            {product.price === null ? (
              <span className="font-display text-2xl text-gold-700 italic">Price on request</span>
            ) : (
              <>
                <span className="font-display text-[2.6rem] leading-none text-ink tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">per piece · USD</span>
              </>
            )}
          </div>

          {product.price === null && (
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
              This piece has no listed price yet. Add it to your order and we&apos;ll confirm the price on WhatsApp.
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <QtyStepper value={pending} min={1} label={product.name} onChange={setPending} />
            <button
              type="button"
              onClick={add}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2.5 bg-ink px-8 text-[12px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-wine-600 active:scale-[0.98]"
            >
              <CartIcon width={17} height={17} />
              Add to order
            </button>
          </div>

          {qty > 0 && (
            <p className="mt-4 inline-flex items-center gap-2 text-[12px] tracking-wide text-forest-600">
              <CheckIcon width={15} height={15} />
              {qty} in your order
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("aldalal:open-cart"))}
                className="border-b border-forest-600/40 pb-0.5 font-semibold transition hover:border-forest-600"
              >
                View order
              </button>
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappUrl(productQuestion(product))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 border border-forest-600/40 px-5 text-[11px] font-semibold tracking-[0.16em] text-forest-700 uppercase transition hover:bg-forest-600 hover:text-paper"
            >
              <WhatsAppIcon width={16} height={16} />
              Ask on WhatsApp
            </a>
            <button
              type="button"
              onClick={share}
              className="inline-flex h-11 items-center gap-2 border border-line px-5 text-[11px] font-semibold tracking-[0.16em] text-ink uppercase transition hover:border-ink"
            >
              <ShareIcon width={16} height={16} />
              Share
            </button>
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 px-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase transition hover:text-ink"
            >
              <ArrowLeftIcon width={16} height={16} />
              Keep browsing
            </Link>
          </div>

          <dl className="mt-12 border-t border-line text-[13px]">
            <div className="flex justify-between gap-4 border-b border-line-soft py-3.5">
              <dt className="tracking-wide text-muted">Order by phone</dt>
              <dd className="flex flex-wrap justify-end gap-4">
                {site.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="inline-flex items-center gap-1.5 text-ink hover:text-gold-700">
                    <PhoneIcon width={13} height={13} />
                    {p.display}
                  </a>
                ))}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line-soft py-3.5">
              <dt className="tracking-wide text-muted">WhatsApp orders</dt>
              <dd className="text-ink">{whatsappDisplay}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="tracking-wide text-muted">Collect from</dt>
              <dd className="text-right text-ink">{site.address}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <ProductRail
          title={category ? `More in ${category.name}` : "You may also like"}
          subtitle="From the same shelf"
          items={related}
          href={category ? catalogHref({ cat: category.id }) : "/products"}
        />
      )}
      <RecentlyViewed exclude={product.id} />
      <PhotoZoom product={product} open={zoomOpen} onClose={() => setZoomOpen(false)} />
    </>
  );
}
