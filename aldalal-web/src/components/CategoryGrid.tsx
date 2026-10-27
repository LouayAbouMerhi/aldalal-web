"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { categories, products } from "@/lib/catalog";
import { useReveal, useTilt } from "@/lib/hooks";
import { catalogHref } from "@/lib/links";
import { ArrowRightIcon } from "./icons";

export function CategoryGrid() {
  const reveal = useReveal<HTMLElement>();
  const covers = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.image && !map.has(p.category)) map.set(p.category, p.image.src);
    }
    return map;
  }, []);

  return (
    <section ref={reveal} data-reveal className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h2 className="text-[1.7rem] text-ink md:text-[2rem]">Shop by department</h2>
        </div>
        <Link href="/products" className="hidden border-b border-gold-500/50 pb-1 text-[11px] font-semibold tracking-[0.18em] text-gold-700 uppercase transition hover:border-gold-700 sm:inline-flex">
          All products
        </Link>
      </div>

      <div className="scene grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((c, i) => (
          <CategoryTile key={c.id} id={c.id} name={c.name} count={c.count} cover={covers.get(c.id)} index={i} />
        ))}
      </div>
    </section>
  );
}

function CategoryTile({
  id,
  name,
  count,
  cover,
  index,
}: {
  id: string;
  name: string;
  count: number;
  cover?: string;
  index: number;
}) {
  const ref = useReveal<HTMLAnchorElement>();
  const { ref: tiltRef, tiltProps } = useTilt<HTMLAnchorElement>(5);
  return (
    <Link
      ref={(node) => {
        ref.current = node;
        tiltRef.current = node;
      }}
      {...tiltProps}
      data-reveal
      style={{ "--reveal-delay": `${Math.min(index, 10) * 40}ms` } as React.CSSProperties}
      href={catalogHref({ cat: id })}
      className="group tilt relative flex flex-col items-center gap-4 overflow-hidden bg-paper px-4 py-7 text-center transition hover:bg-surface hover:shadow-[0_24px_40px_-30px_rgb(36_30_26/0.6)]"
    >
      <span className="pointer-events-none absolute top-5 left-1/2 size-28 -translate-x-1/2 rounded-full bg-gold-100/60 transition duration-700 group-hover:scale-125" />
      <span
        className="tilt-layer relative block size-24 shrink-0 mix-blend-multiply"
        style={{ "--depth": "26px" } as React.CSSProperties}
      >
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="96px"
            draggable={false}
            className="no-save object-contain transition duration-500 group-hover:-rotate-6 group-hover:scale-110"
          />
        )}
      </span>
      <span className="mt-auto">
        <span className="font-display block text-[15px] leading-snug text-ink">{name}</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          {count} products
          <ArrowRightIcon width={12} height={12} className="transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
