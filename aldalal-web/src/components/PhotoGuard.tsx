"use client";

import { useEffect } from "react";
import { site } from "@/config/site";

/**
 * Site-wide photo protection.
 * Blocks the right-click menu, dragging images, the "save page" and
 * developer-tools shortcuts, and copying images to the clipboard.
 *
 * Nothing can prevent a screenshot — this stops the easy ways only.
 */
export function PhotoGuard() {
  useEffect(() => {
    if (!site.protectPhotos) return;

    const stop = (e: Event) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const blocked =
        e.key === "F12" ||
        (mod && ["s", "u", "p"].includes(k)) ||
        (mod && e.shiftKey && ["i", "j", "c"].includes(k));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onCopy = (e: ClipboardEvent) => {
      // Text can still be copied; images cannot
      const selection = window.getSelection()?.toString() ?? "";
      if (!selection) e.preventDefault();
    };

    document.addEventListener("contextmenu", stop);
    document.addEventListener("dragstart", stop);
    document.addEventListener("copy", onCopy);
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("dragstart", stop);
      document.removeEventListener("copy", onCopy);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);

  return null;
}
