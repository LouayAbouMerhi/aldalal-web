"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { site } from "@/config/site";
import type { Product } from "@/lib/catalog";
import { watermarkUrl } from "@/lib/watermark";
import { ImageOffIcon } from "./icons";

type Props = {
  product: Product;
  sizes: string;
  className?: string;
  /** Load immediately (for photos visible on first paint). */
  eager?: boolean;
  /** Also preload it — for the one big photo on a product page. */
  preload?: boolean;
  /** Small thumbnails skip the watermark. */
  plain?: boolean;
  /** Use the bigger, sharpened copy (product page, zoom view). */
  large?: boolean;
};

/**
 * Square product photo.
 * Photos are protected: no right-click menu, no dragging, no long-press save,
 * and a transparent layer sits on top so the browser never targets the image.
 */
export function ProductImage({
  product,
  sizes,
  className = "",
  eager = false,
  preload = false,
  plain = false,
  large = false,
}: Props) {
  const photo = (large && product.image?.large) || product.image;
  const watermarked = site.protectPhotos && !plain && product.image;

  return (
    <div
      className={`no-save relative aspect-square overflow-hidden bg-surface ${watermarked ? "watermark" : ""} ${className}`}
      style={watermarked ? ({ "--watermark": watermarkUrl } as CSSProperties) : undefined}
      onContextMenu={site.protectPhotos ? (e) => e.preventDefault() : undefined}
    >
      {photo ? (
        <Image
          src={photo.src}
          alt={product.name}
          fill
          sizes={sizes}
          loading={eager || preload ? "eager" : "lazy"}
          preload={preload}
          draggable={false}
          className="object-contain p-4 select-none"
        />
      ) : (
        <div className="grid h-full place-items-center text-line">
          <ImageOffIcon width={36} height={36} />
        </div>
      )}
      {site.protectPhotos && <span className="photo-guard" aria-hidden />}
    </div>
  );
}
