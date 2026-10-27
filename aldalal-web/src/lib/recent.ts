"use client";

import { useMemo } from "react";
import { createIdListStore } from "./persist";
import { productById, type Product } from "./catalog";

/** Last products the customer opened, newest first. */
export const recent = createIdListStore("aldalal-recent-v1", 16);

export function useRecentProducts(exclude?: string): Product[] {
  const list = recent.use();
  return useMemo(
    () =>
      list
        .filter((id) => id !== exclude)
        .map((id) => productById.get(id))
        .filter((p): p is Product => !!p),
    [list, exclude],
  );
}
