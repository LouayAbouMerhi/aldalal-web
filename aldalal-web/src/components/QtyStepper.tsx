"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "./icons";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  label: string;
  size?: "sm" | "md";
  /** Allow going down to 0 (removes the item). */
  min?: number;
  /** Stretch to the full width of the parent. */
  block?: boolean;
};

export function QtyStepper({ value, onChange, label, size = "md", min = 0, block = false }: Props) {
  const btn = size === "sm" ? "size-8" : "size-10";
  // While typing, keep the raw text so clearing the box doesn't remove the item
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div
      className={`${block ? "flex w-full" : "inline-flex"} items-center justify-between border border-line bg-surface`}
      role="group"
      aria-label={`Quantity for ${label}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btn} grid place-items-center text-wine-600 transition hover:bg-wine-50 disabled:opacity-40`}
        aria-label="Decrease quantity"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={999}
        value={draft ?? value}
        onChange={(e) => {
          const text = e.target.value.replace(/\D/g, "").slice(0, 3);
          setDraft(text);
          const n = Number(text);
          if (text && n >= Math.max(1, min)) onChange(n);
        }}
        onFocus={(e) => e.target.select()}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={`no-spin font-display ${block ? "min-w-0 flex-1" : "w-9"} bg-transparent text-center tabular-nums outline-none ${size === "sm" ? "text-[15px]" : "text-[17px]"}`}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= 999}
        className={`${btn} grid place-items-center text-wine-600 transition hover:bg-wine-50 disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
