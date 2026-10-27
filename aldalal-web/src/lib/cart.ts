"use client";

import { useSyncExternalStore } from "react";
import { productById, type Product } from "./catalog";

/** Cart = product id -> quantity, saved in localStorage. */
export type CartState = Readonly<Record<string, number>>;

const STORAGE_KEY = "aldalal-cart-v1";
const MAX_QTY = 999;
const EMPTY: CartState = Object.freeze({});

let state: CartState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = readStorage();
}

function readStorage(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean: Record<string, number> = {};
    for (const [id, qty] of Object.entries(parsed)) {
      // Drop products that are no longer in the price list
      if (productById.has(id) && typeof qty === "number" && qty > 0) {
        clean[id] = Math.min(Math.floor(qty), MAX_QTY);
      }
    }
    return clean;
  } catch {
    return EMPTY;
  }
}

function commit(next: CartState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full: the cart still works for this visit
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  state = readStorage();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const cart = {
  setQty(id: string, qty: number) {
    load();
    const next = { ...state };
    const q = Math.max(0, Math.min(MAX_QTY, Math.floor(qty) || 0));
    if (q === 0) delete next[id];
    else next[id] = q;
    commit(next);
  },
  add(id: string, qty = 1) {
    load();
    cart.setQty(id, (state[id] ?? 0) + qty);
  },
  remove(id: string) {
    cart.setQty(id, 0);
  },
  clear() {
    commit(EMPTY);
  },
};

export type CartLine = { product: Product; qty: number; lineTotal: number | null };

export function summarize(state: CartState) {
  const lines: CartLine[] = [];
  for (const [id, qty] of Object.entries(state)) {
    const product = productById.get(id);
    if (!product) continue;
    lines.push({ product, qty, lineTotal: product.price === null ? null : round(product.price * qty) });
  }
  const pieces = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = round(lines.reduce((n, l) => n + (l.lineTotal ?? 0), 0));
  const unpriced = lines.filter((l) => l.lineTotal === null).length;
  return { lines, pieces, subtotal, unpriced };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
