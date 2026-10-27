"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/config/site";
import { products } from "@/lib/catalog";
import { useTilt } from "@/lib/hooks";
import { whatsappUrl } from "@/lib/whatsapp";
import { ArrowRightIcon, WhatsAppIcon } from "./icons";

type Photo = { src: string; alt: string };

export function Hero({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(0);
  const { ref: tiltRef, tiltProps } = useTilt<HTMLDivElement>(11);
  const shown = photos.slice(0, 5);

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* paper texture and a warm wash of light */}
      <span className="pointer-events-none absolute -top-40 -left-32 size-[34rem] rounded-full bg-gold-100/60 blur-3xl" />
      <span className="pointer-events-none absolute -right-40 bottom-0 size-[30rem] rounded-full bg-wine-50/70 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:py-20">
        <div>
          <p className="eyebrow enter">Wholesale · {site.address.replace(/, Lebanon$/, "")}</p>

          <h1 className="enter enter-1 mt-6 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02]">
            Care, kept
            <span className="mt-1 block italic text-wine-600">in good taste.</span>
          </h1>

          <div className="enter enter-2 rule-gold my-7 w-20" />

          <p className="enter enter-2 text-[14px] tracking-wide text-muted">
            {products.length} products · wholesale prices in US dollars
          </p>

          <div className="enter enter-3 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="group inline-flex h-12 items-center gap-3 bg-ink px-7 text-[12px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-wine-600"
            >
              View the catalogue
              <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappUrl(`Hello ${site.name}, I would like to order from your price list.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 border border-ink px-6 text-[12px] font-semibold tracking-[0.18em] uppercase transition hover:bg-ink hover:text-paper"
            >
              <WhatsAppIcon width={17} height={17} />
              WhatsApp
            </a>
          </div>

        </div>

        {/* The pedestal: a product floating over its shadow, tilting with the mouse */}
        <div className="scene-deep enter enter-2">
          <div ref={tiltRef} {...tiltProps} className="tilt relative mx-auto aspect-[4/5] w-full max-w-sm">
            <span className="absolute inset-x-8 top-6 bottom-6 border border-line-soft bg-surface" />
            <span className="absolute inset-x-4 top-3 bottom-3 border border-line" />

            <div className="tilt-layer absolute inset-0 grid place-items-center" style={{ "--depth": "60px" } as React.CSSProperties}>
              {shown.map((photo, i) => (
                <span
                  key={photo.src}
                  className={`no-save absolute inset-10 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                    i === active ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
                  }`}
                >
                  <span className="float-product relative block size-full mix-blend-multiply">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="380px"
                      draggable={false}
                      priority={i === 0}
                      className="object-contain"
                    />
                  </span>
                </span>
              ))}
            </div>

            <span className="pedestal-shadow absolute bottom-12 left-1/2 h-8 w-48 -translate-x-1/2" />
            <span className="tilt-sheen" />
          </div>

          {/* thumbnails swap the product on the pedestal */}
          <div className="mt-6 flex justify-center gap-2">
            {shown.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-label={`Show product ${i + 1}`}
                aria-pressed={i === active}
                className={`no-save relative size-14 border bg-surface p-1.5 transition ${
                  i === active ? "border-gold-500" : "border-line hover:border-gold-300"
                }`}
              >
                <Image src={photo.src} alt="" fill sizes="56px" draggable={false} className="object-contain p-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
