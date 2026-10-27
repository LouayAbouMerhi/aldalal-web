import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center gap-5 px-4 py-24 text-center lg:py-32">
      <span className="eyebrow">Page not found</span>
      <h1 className="font-display text-[2rem] leading-tight text-ink md:text-[2.6rem]">
        This shelf is empty
      </h1>
      <span className="rule-gold w-24" aria-hidden />
      <p className="max-w-sm text-[14px] leading-relaxed text-muted">
        The page you asked for is not in the catalogue. It may have been renamed, or the product is no longer
        in the price list.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-ink/90"
        >
          Browse all products
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
