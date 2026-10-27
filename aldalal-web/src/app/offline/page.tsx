import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Offline | ${site.name}`,
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center gap-5 px-4 py-24 text-center lg:py-32">
      <span className="eyebrow">No connection</span>
      <h1 className="font-display text-[2rem] leading-tight text-ink md:text-[2.6rem]">
        You are offline
      </h1>
      <span className="rule-gold w-24" aria-hidden />
      <p className="max-w-sm text-[14px] leading-relaxed text-muted">
        This page has not been saved on your device yet. Everything you already opened still works without
        internet — try the catalogue or your saved products.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-ink/90"
        >
          Open the catalogue
        </Link>
        <Link
          href="/"
          className="border border-line px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ink uppercase transition hover:border-ink"
        >
          Maison
        </Link>
      </div>
    </div>
  );
}
