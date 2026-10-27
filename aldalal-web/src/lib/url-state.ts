"use client";

import { useSyncExternalStore } from "react";
import { isValidCategory, isValidSort, type SortKey } from "./catalog";
import { CATALOG_PATH, filtersToQuery } from "./links";

export { catalogHref, filtersToQuery, CATALOG_PATH } from "./links";

/**
 * Catalog filters, shared by the header search box and the /products page.
 * While the catalog is open they are mirrored into the URL (?q= &cat= &sort=)
 * so a filtered view can be shared or reloaded.
 */
export type Filters = { q: string; cat: string | null; sort: SortKey };

const EMPTY: Filters = { q: "", cat: null, sort: "default" };

let state: Filters = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(search: string): Filters {
  const params = new URLSearchParams(search);
  const cat = params.get("cat");
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    cat: isValidCategory(cat) ? cat : null,
    sort: isValidSort(sort) ? sort : "default",
  };
}

const onCatalog = () => window.location.pathname.replace(/\/$/, "") === CATALOG_PATH;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  if (onCatalog()) state = parse(window.location.search);
}

const notify = () => listeners.forEach((l) => l());

function onPopState() {
  if (onCatalog()) {
    state = parse(window.location.search);
    notify();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("popstate", onPopState);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", onPopState);
  };
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => EMPTY;

export function setFilters(patch: Partial<Filters>) {
  load();
  state = { ...state, ...patch };
  if (typeof window !== "undefined" && onCatalog()) {
    // Next.js patches replaceState and keeps its router in sync (pass null, not the current state)
    window.history.replaceState(null, "", `${window.location.pathname}${filtersToQuery(state)}`);
  }
  notify();
}

export function getFilters() {
  return getSnapshot();
}

export function useFilters() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
