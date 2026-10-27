"use client";

import { useMemo } from "react";
import { createIdListStore } from "./persist";
import { productById, type Product } from "./catalog";

/** Products the customer saved with the heart button. */
export const favorites = createIdListStore("aldalal-favorites-v1", 200);

export function useFavorites() {
  return favorites.use();
}

export function useFavoriteSet() {
  const list = useFavorites();
  return useMemo(() => new Set(list), [list]);
}

export function useFavoriteProducts(): Product[] {
  const list = useFavorites();
  return useMemo(() => list.map((id) => productById.get(id)).filter((p): p is Product => !!p), [list]);
}
