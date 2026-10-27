"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny store backed by localStorage and shared across the whole app.
 * Server render always sees `empty`, the browser loads the saved value on first read,
 * and other tabs stay in sync through the `storage` event.
 */
export function createPersistentStore<T>(key: string, empty: T, revive: (raw: unknown) => T) {
  let state = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? revive(JSON.parse(raw)) : empty;
    } catch {
      return empty;
    }
  };

  const notify = () => listeners.forEach((l) => l());

  const onStorage = (e: StorageEvent) => {
    if (e.key !== key) return;
    state = read();
    notify();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  };

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    state = read();
  };

  const get = () => {
    load();
    return state;
  };

  const set = (next: T) => {
    load();
    state = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private mode or full storage: the value still works for this visit
    }
    notify();
  };

  const use = () => useSyncExternalStore(subscribe, get, () => empty);

  return { get, set, use, subscribe };
}

/** Keeps a short list of ids, newest first, without duplicates. */
export function createIdListStore(key: string, max: number) {
  const store = createPersistentStore<string[]>(key, [], (raw) =>
    Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string").slice(0, max) : [],
  );
  return {
    ...store,
    add(id: string) {
      store.set([id, ...store.get().filter((x) => x !== id)].slice(0, max));
    },
    remove(id: string) {
      store.set(store.get().filter((x) => x !== id));
    },
    toggle(id: string) {
      const list = store.get();
      store.set(list.includes(id) ? list.filter((x) => x !== id) : [id, ...list].slice(0, max));
    },
    clear() {
      store.set([]);
    },
  };
}
