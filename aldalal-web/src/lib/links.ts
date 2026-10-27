import type { SortKey } from "./catalog";

/** Shared link helpers — safe to use from server and client components. */
export const CATALOG_PATH = "/products";

export type FilterQuery = { q?: string; cat?: string | null; sort?: SortKey };

export function filtersToQuery(filters: FilterQuery): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.cat) params.set("cat", filters.cat);
  if (filters.sort && filters.sort !== "default") params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Link to the catalog with these filters applied. */
export function catalogHref(filters: FilterQuery) {
  return `${CATALOG_PATH}${filtersToQuery(filters)}`;
}

export function productHref(id: string) {
  return `/product/${id}`;
}
