"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  labelledBy?: string;
  children: ReactNode;
};

/** Thin wrapper around <dialog>: focus trap, Esc to close, click on backdrop to close. */
export function Modal({ open, onClose, className = "", labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        // A click directly on the <dialog> element means the backdrop was clicked
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      className={className}
    >
      {open && children}
    </dialog>
  );
}
