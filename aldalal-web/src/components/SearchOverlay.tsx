"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, categoryById, matches, products, searchTokens } from "@/lib/catalog";
import { setFilters } from "@/lib/url-state";
import { catalogHref } from "@/lib/links";
import { Modal } from "./Modal";
import { Price } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { ArrowRightIcon, CloseIcon, SearchIcon } from "./icons";

const SUGGESTIONS = ["Shampoo", "Deodorant", "Colgate", "Dove", "Nivea", "Baby", "Gillette", "Perfume"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="search-title"
      className="pop m-0 mx-auto mt-0 w-full max-w-none bg-transparent p-0 sm:mt-[8vh] sm:w-[min(100vw-2rem,40rem)]"
    >
      <SearchPanel onClose={onClose} />
    </Modal>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, []);

  const tokens = useMemo(() => searchTokens(query), [query]);
  const results = useMemo(() => (tokens.length ? products.filter((p) => matches(p, tokens)) : []), [tokens]);
  const matchedCategories = useMemo(
    () => (tokens.length ? categories.filter((c) => tokens.every((t) => c.name.toLowerCase().includes(t))) : []),
    [tokens],
  );

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const seeAll = () => {
    setFilters({ q: query, cat: null });
    go(catalogHref({ q: query }));
  };

  return (
    <div className="mx-auto flex h-dvh w-full flex-col overflow-hidden border border-line bg-paper shadow-2xl sm:h-auto sm:max-h-[80vh]">
      <form
        className="flex items-center gap-2 border-b border-line bg-surface px-3 py-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) seeAll();
        }}
      >
        <SearchIcon className="ml-1 shrink-0 text-gold-600" width={22} height={22} />
        <label htmlFor="overlay-search" className="sr-only" id="search-title">
          Search products
        </label>
        <input
          ref={inputRef}
          id="overlay-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${products.length} products…`}
          enterKeyHint="search"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/60"
        />
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center text-muted hover:text-ink"
          aria-label="Close search"
        >
          <CloseIcon />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {!query.trim() ? (
          <div className="grid gap-4">
            <p className="eyebrow">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="border border-line bg-surface px-4 py-2 text-[12px] font-semibold tracking-[0.1em] text-ink uppercase transition hover:border-gold-400 hover:text-gold-700"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="eyebrow">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFilters({ q: "", cat: c.id });
                    go(catalogHref({ cat: c.id }));
                  }}
                  className="flex items-center justify-between gap-2 border border-line bg-surface px-3 py-2.5 text-left text-[13px] text-ink transition hover:border-gold-400 hover:text-gold-700"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs text-muted tabular-nums">{c.count}</span>
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="grid place-items-center gap-2 py-12 text-center">
            <p className="font-display text-xl">No products found</p>
            <p className="text-sm text-muted">Try a brand name, like “Dove”, or a shorter word.</p>
          </div>
        ) : (
          <div className="grid gap-1">
            {matchedCategories.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {matchedCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setFilters({ q: "", cat: c.id });
                      go(catalogHref({ cat: c.id }));
                    }}
                    className="border border-gold-300 bg-gold-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-gold-700 uppercase"
                  >
                    {c.name} · {c.count}
                  </button>
                ))}
              </div>
            )}
            {results.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 transition hover:bg-surface"
              >
                <span className="w-14 shrink-0 overflow-hidden ring-1 ring-line">
                  <ProductImage product={p} sizes="56px" plain />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display line-clamp-2 block text-[14px] leading-snug">{p.name}</span>
                  <span className="text-xs text-muted">{categoryById.get(p.category)?.name}</span>
                </span>
                <Price price={p.price} className="shrink-0 text-sm" />
              </Link>
            ))}
            <button
              type="button"
              onClick={seeAll}
              className="mt-3 inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-paper uppercase hover:bg-wine-600"
            >
              See all {results.length} results
              <ArrowRightIcon width={16} height={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
