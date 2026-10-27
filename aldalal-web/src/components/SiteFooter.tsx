"use client";

import Link from "next/link";
import Image from "next/image";
import { site, whatsappDisplay } from "@/config/site";
import { categories, lastUpdated, products } from "@/lib/catalog";
import { catalogHref } from "@/lib/links";
import { whatsappUrl } from "@/lib/whatsapp";
import { InstallButton } from "./InstallPrompt";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

export function SiteFooter() {
  const updated = new Date(lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Beirut",
  });

  return (
    <footer className="relative mt-20 border-t border-line bg-surface text-muted">

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={48} height={48} className="size-12 rounded-sm ring-1 ring-line" />
            <div>
              <p className="font-display text-2xl tracking-[0.18em] text-ink">{site.name}</p>
              <p className="mt-1 text-[9px] font-semibold tracking-[0.34em] text-muted uppercase">For General Trading</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-muted">
            {products.length} products across {categories.length} categories — personal care, home care and more, at wholesale
            prices in US dollars.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={whatsappUrl(`Hello ${site.name}, I have a question about your price list.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-forest-600 px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-paper uppercase transition hover:bg-forest-700"
            >
              <WhatsAppIcon width={18} height={18} />
              WhatsApp {whatsappDisplay}
            </a>
            <InstallButton />
          </div>
        </div>

        <nav aria-label="Categories">
          <p className="eyebrow border-b border-line pb-3">Top categories</p>
          <ul className="mt-4 grid gap-2.5 text-[13.5px]">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link href={catalogHref({ cat: c.id })} className="text-ink transition hover:text-gold-700">
                  {c.name} <span className="text-muted tabular-nums">{c.count}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="border-b border-gold-500/50 pb-0.5 text-[11px] font-semibold tracking-[0.16em] text-gold-700 uppercase">
                See all products →
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow border-b border-line pb-3">Contact</p>
          <ul className="mt-4 grid gap-3 text-[13.5px]">
            {site.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 text-ink transition hover:text-gold-700">
                  <PhoneIcon width={16} height={16} />
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-ink transition hover:text-gold-700"
              >
                <PinIcon width={16} height={16} className="mt-0.5 shrink-0" />
                {site.address}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-line bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pt-6 pb-28 text-[11px] tracking-wide text-muted lg:px-8 lg:pb-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date(lastUpdated).getFullYear()} {site.fullName}. Prices in USD and may change without notice.</p>
          <p>Price list updated {updated}</p>
        </div>
      </div>
    </footer>
  );
}
