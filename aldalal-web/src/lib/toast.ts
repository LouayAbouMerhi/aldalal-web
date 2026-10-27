"use client";

import { useSyncExternalStore } from "react";

export type Toast = {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  action?: { label: string; onClick: () => void };
};

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => toasts;
const EMPTY: Toast[] = [];
const getServerSnapshot = () => EMPTY;

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function toast(input: Omit<Toast, "id">, duration = 3200) {
  const id = nextId++;
  toasts = [...toasts.filter((t) => t.title !== input.title || t.description !== input.description), { id, ...input }].slice(-3);
  notify();
  if (typeof window !== "undefined") window.setTimeout(() => dismissToast(id), duration);
  return id;
}

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
