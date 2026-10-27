"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  categoryById,
  matches,
  products,
  searchTokens,
  sortProducts,
  SORT_OPTIONS,
  type Product,
  type SortKey,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useFavoriteSet } from "@/lib/favorites";
import { useReveal, useTilt } from "@/lib/hooks";
import { setFilters, useFilters } from "@/lib/url-state";
import { ProductCard } from "./ProductCard";
import { ChevronDownIcon, CloseIcon, SearchIcon } from "./icons";

const PAGE = 24;

export function Catalog() {
  const filters = useFilters();
  const cartState = useCart();
  const favoriteSet = useFavoriteSet();

  const query = useDeferredValue(filters.q);
  const tokens = useMemo(() => searchTokens(query), [query]);
  const searched = useMemo(() => products.filter((p) => matches(p, tokens)), [tokens]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of searched) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [searched]);
  const results = useMemo(
    () => sortProducts(filters.cat ? searched.filter((p) => p.category === filters.cat) : searched, filters.sort),
    [searched, filters.cat, filters.sort],
  );

  // Render in pages; back to the first page whenever the filters change
  const viewKey = `${query}|${filters.cat}|${filters.sort}`;
  const [pager, setPager] = useState({ key: viewKey, limit: PAGE });
  const limit = pager.key === viewKey ? pager.limit : PAGE;
  const shown = results.slice(0, limit);
  const hasMore = results.length > limit;
  const showMore = useCallback(() => setPager({ key: viewKey, limit: limit + PAGE }), [viewKey, limit]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && showMore(), { rootMargin: "1400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, showMore]);

  const grouped = filters.sort === "default" && !filters.cat;
  const groups = useMemo(() => groupByCategory(shown, grouped), [shown, grouped]);
  const eagerIds = new Set(shown.slice(0, 8).map((p) => p.id));

  const resultsRef = useRef<HTMLDivElement>(null);
  const pickCategory = useCallback((cat: string | null) => {
    setFilters({ cat });
    const top = resultsRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 120) resultsRef.current?.scrollIntoView({ block: "start" });
  }, []);

  const covers = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) if (p.image && !m.has(p.category)) m.set(p.category, p.image.src);
    return m;
  }, []);

  const activeCategory = filters.cat ? categoryById.get(filters.cat) : null;

  return (
    <>
      <CatalogHero
        title={activeCategory?.name ?? "All products"}
        categoryName={activeCategory?.name ?? null}
        cover={activeCategory ? (covers.get(activeCategory.id) ?? null) : null}
        count={results.length}
        query={query}
        onClear={() => setFilters({ q: "" })}
      />

      <FilterBar active={filters.cat} counts={counts} total={searched.length} onPick={pickCategory} covers={covers} />

      <div ref={resultsRef} className="mx-auto flex max-w-7xl scroll-mt-32 gap-10 px-4 pt-4 pb-20 lg:px-8">
        <CategorySidebar active={filters.cat} counts={counts} total={searched.length} onPick={pickCategory} covers={covers} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-[12px] tracking-[0.1em] text-muted uppercase" aria-live="polite">
              <span className="font-display text-base text-ink tabular-nums">{results.length}</span>{" "}
              {results.length === 1 ? "product" : "products"}
              {activeCategory && (
                <>
                  {" "}in <span className="text-ink">{activeCategory.name}</span>
                </>
              )}
              {query.trim() && (
                <>
                  {" "}for “<span className="text-ink italic">{query.trim()}</span>”
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {(filters.q || filters.cat) && (
                <button
                  type="button"
                  onClick={() => setFilters({ q: "", cat: null })}
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase transition hover:border-gold-400 hover:text-gold-700"
                >
                  <CloseIcon width={14} height={14} />
                  Clear
                </button>
              )}
              <SortSelect value={filters.sort} onChange={(sort) => setFilters({ sort })} />
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              query={query}
              otherMatches={filters.cat ? searched.length : 0}
              onClearSearch={() => setFilters({ q: "" })}
              onAllCategories={() => pickCategory(null)}
            />
          ) : (
            groups.map((g, gi) => (
              <Fragment key={`${g.category ?? "all"}-${gi}`}>
                {g.category && (
                  <h2 className={`${gi === 0 ? "mt-6" : "mt-14"} mb-5 flex items-baseline gap-4 text-2xl text-ink`}>
                    {categoryById.get(g.category)?.name}
                    <span className="rule-gold flex-1" />
                    <span className="font-sans text-[11px] font-semibold tracking-[0.16em] text-muted tabular-nums">
                      {counts.get(g.category)}
                    </span>
                  </h2>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {g.items.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={i}
                      qty={cartState[p.id] ?? 0}
                      favorite={favoriteSet.has(p.id)}
                      eager={eagerIds.has(p.id)}
                      categoryName={grouped || filters.cat ? undefined : categoryById.get(p.category)?.name}
                    />
                  ))}
                </div>
              </Fragment>
            ))
          )}

          {hasMore && (
            <div ref={sentinel} className="flex justify-center py-10">
              <button
                type="button"
                onClick={showMore}
                className="border border-ink px-8 py-3.5 text-[11px] font-semibold tracking-[0.2em] text-ink uppercase transition hover:bg-ink hover:text-paper"
              >
                Show more ({results.length - limit} left)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CatalogHero({
  title,
  categoryName,
  cover,
  count,
  query,
  onClear,
}: {
  title: string;
  categoryName: string | null;
  cover: string | null;
  count: number;
  query: string;
  onClear: () => void;
}) {
  const { ref: tiltRef, tiltProps } = useTilt<HTMLDivElement>(8);
  const heading = query.trim() ? `“${query.trim()}”` : title;

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <span className="pointer-events-none absolute -top-40 -right-24 hidden size-96 rounded-full bg-gold-100/45 blur-3xl lg:block" aria-hidden />
      <div className="scene mx-auto grid max-w-7xl items-center gap-10 px-4 py-9 lg:grid-cols-[minmax(0,1fr)_17rem] lg:px-8 lg:py-12">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="enter">
            <ol className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
              <li>
                <Link href="/" className="transition hover:text-gold-700">
                  Maison
                </Link>
              </li>
              <li aria-hidden className="text-line">/</li>
              <li className={categoryName ? "" : "text-ink"}>
                {categoryName ? (
                  <Link href="/products" className="transition hover:text-gold-700">
                    Catalogue
                  </Link>
                ) : (
                  "Catalogue"
                )}
              </li>
              {categoryName && (
                <>
                  <li aria-hidden className="text-line">/</li>
                  <li className="text-ink">{categoryName}</li>
                </>
              )}
            </ol>
          </nav>

          <h1
            key={heading}
            className="enter enter-1 mt-4 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] text-ink"
          >
            {query.trim() ? <span className="italic">{heading}</span> : heading}
          </h1>

          <div className="enter enter-2 mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
            <Stat value={count} label={count === 1 ? "product" : "products"} />
            <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
            <Stat value={categories.length} label="departments" />
            <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
            <span className="leading-none">
              <span className="font-display block text-[1.35rem] text-ink">USD</span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">wholesale</span>
            </span>
            {query.trim() && (
              <button
                type="button"
                onClick={onClear}
                className="ml-auto inline-flex items-center gap-1.5 border border-line px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase transition hover:border-gold-400 hover:text-gold-700"
              >
                <CloseIcon width={13} height={13} />
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* The department on its pedestal, or the shop line when nothing is picked */}
        <div className="enter enter-3 hidden lg:block">
          {cover ? (
            <div ref={tiltRef} {...tiltProps} className="tilt relative aspect-square bg-paper ring-1 ring-line">
              <span className="pointer-events-none absolute inset-3 border border-line-soft" aria-hidden />
              <span
                className="tilt-layer absolute inset-7 mix-blend-multiply"
                style={{ "--depth": "40px" } as React.CSSProperties}
              >
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="220px"
                  draggable={false}
                  className="no-save float-product object-contain"
                />
              </span>
              <span className="pedestal-shadow absolute bottom-6 left-1/2 h-5 w-1/2 -translate-x-1/2" aria-hidden />
              <span className="tilt-sheen" aria-hidden />
            </div>
          ) : (
            <div className="border border-line bg-paper p-6">
              <p className="eyebrow">Wholesale</p>
              <p className="font-display mt-3 text-[1.45rem] leading-snug text-ink">
                Every item photographed and priced.
              </p>
              <span className="rule-gold mt-4 block w-14" aria-hidden />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                Build your order here, then send the whole list to us on WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="leading-none">
      <span className="font-display block text-[1.35rem] text-ink tabular-nums">{value}</span>
      <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">{label}</span>
    </span>
  );
}

type CategoryNavProps = {
  active: string | null;
  counts: Map<string, number>;
  total: number;
  onPick: (id: string | null) => void;
};

function FilterBar({ active, counts, total, onPick, covers }: CategoryNavProps & { covers: Map<string, string> }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = scroller.current;
    const chip = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!box || !chip) return;
    box.scrollTo({ left: chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const chip = (selected: boolean, dim: boolean) =>
    `flex shrink-0 items-center gap-2 border py-1.5 pr-4 pl-2 text-[11px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap transition ${
      selected ? "border-ink bg-ink text-paper" : `border-line bg-surface text-muted ${dim ? "opacity-40" : ""}`
    }`;

  return (
    <nav aria-label="Categories" className="sticky top-16 z-20 border-b border-line bg-paper/95 backdrop-blur lg:hidden">
      <div ref={scroller} className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto bg-paper px-4 py-3">
        <button type="button" aria-pressed={!active} onClick={() => onPick(null)} className={`${chip(!active, false)} !pl-4`}>
          All <span className="opacity-60 tabular-nums">{total}</span>
        </button>
        {categories.map((c) => {
          const n = counts.get(c.id) ?? 0;
          const cover = covers.get(c.id);
          const selected = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(c.id)}
              className={chip(selected, n === 0)}
            >
              <span className={`relative size-7 shrink-0 ${selected ? "" : "mix-blend-multiply"}`}>
                {cover && (
                  <Image src={cover} alt="" fill sizes="28px" draggable={false} className="no-save object-contain" />
                )}
              </span>
              {c.name} <span className="opacity-60 tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type SidebarProps = CategoryNavProps & { covers: Map<string, string> };

/**
 * Departments, each with a photo of something from that shelf.
 * The nav paints its own background so the photos' white backgrounds can
 * multiply into the paper instead of sitting in white squares.
 */
function CategorySidebar({ active, counts, total, onPick, covers }: SidebarProps) {
  const row = (selected: boolean, dim: boolean) =>
    `group relative flex w-full items-center gap-3 py-2 pr-2 pl-4 text-left transition ${
      selected ? "bg-surface" : `hover:bg-surface/70 ${dim ? "opacity-40" : ""}`
    }`;

  return (
    <aside className="hidden w-[15.5rem] shrink-0 lg:block">
      <nav
        aria-label="Categories"
        className="no-scrollbar sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto bg-paper pr-1"
      >
        <p className="eyebrow sticky top-0 z-10 bg-paper pb-3">Departments</p>
        <ul>
          <li>
            <button type="button" aria-pressed={!active} onClick={() => onPick(null)} className={row(!active, false)}>
              <span
                className={`absolute inset-y-1 left-0 w-[3px] transition ${!active ? "bg-gold-500" : "bg-transparent"}`}
                aria-hidden
              />
              <span className="grid size-10 shrink-0 place-items-center border border-line text-[9px] font-semibold tracking-[0.12em] text-gold-700">
                ALL
              </span>
              <span className="min-w-0 flex-1">
                <span className={`font-display block text-[13.5px] leading-tight ${!active ? "text-wine-600" : "text-ink"}`}>
                  All products
                </span>
                <span className="mt-0.5 block text-[10px] tracking-[0.12em] text-muted uppercase tabular-nums">
                  {total} items
                </span>
              </span>
            </button>
          </li>
          {categories.map((c) => {
            const n = counts.get(c.id) ?? 0;
            const selected = active === c.id;
            const cover = covers.get(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPick(c.id)}
                  className={row(selected, n === 0)}
                >
                  <span
                    className={`absolute inset-y-1 left-0 w-[3px] transition ${selected ? "bg-gold-500" : "bg-transparent"}`}
                    aria-hidden
                  />
                  <span className="relative size-10 shrink-0 mix-blend-multiply">
                    {cover && (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="40px"
                        draggable={false}
                        className="no-save object-contain transition duration-500 group-hover:scale-110"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`font-display line-clamp-2 block text-[13.5px] leading-tight ${selected ? "text-wine-600" : "text-ink"}`}
                      title={c.name}
                    >
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] tracking-[0.12em] text-muted uppercase tabular-nums">
                      {n} items
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="relative flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted uppercase">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-10 appearance-none border border-line bg-surface pr-9 pl-4 text-[12px] font-semibold tracking-[0.1em] text-ink uppercase outline-none focus:border-gold-400"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon width={16} height={16} className="pointer-events-none absolute right-3 text-muted" />
    </label>
  );
}

function EmptyState({
  query,
  otherMatches,
  onClearSearch,
  onAllCategories,
}: {
  query: string;
  otherMatches: number;
  onClearSearch: () => void;
  onAllCategories: () => void;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal="zoom"
      className="flex flex-col items-center gap-4 border border-line bg-surface px-6 py-20 text-center"
    >
      <div className="grid size-16 place-items-center border border-line text-gold-600">
        <SearchIcon width={28} height={28} />
      </div>
      <p className="font-display text-2xl">Nothing here</p>
      <p className="max-w-sm text-sm text-muted">
        {query.trim() ? <>Nothing matches “{query.trim()}” here. Try a brand name or a shorter word.</> : <>This category is empty.</>}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {otherMatches > 0 && (
          <button
            type="button"
            onClick={onAllCategories}
            className="bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-wine-600"
          >
            See {otherMatches} {otherMatches === 1 ? "match" : "matches"} in all categories
          </button>
        )}
        {query.trim() && (
          <button
            type="button"
            onClick={onClearSearch}
            className="border border-line px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ink uppercase transition hover:border-ink"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
}

function groupByCategory(items: Product[], grouped: boolean) {
  if (!grouped) return [{ category: null as string | null, items }];
  const out: { category: string | null; items: Product[] }[] = [];
  for (const p of items) {
    const last = out[out.length - 1];
    if (last && last.category === p.category) last.items.push(p);
    else out.push({ category: p.category, items: [p] });
  }
  return out;
}
