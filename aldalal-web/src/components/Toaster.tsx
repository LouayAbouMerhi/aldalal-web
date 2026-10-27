"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { dismissToast, useToasts } from "@/lib/toast";
import { CheckIcon, CloseIcon } from "./icons";

export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end lg:px-0">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-line bg-surface py-2.5 pr-2.5 pl-3 text-ink shadow-[0_24px_50px_-28px_rgb(36_30_26/0.7)]"
          >
            {t.image ? (
              <span className="relative size-11 shrink-0 overflow-hidden border border-line bg-surface">
                <Image src={t.image} alt="" fill sizes="44px" className="object-contain p-1" />
              </span>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center border border-line text-gold-700">
                <CheckIcon />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold tracking-wide">{t.title}</p>
              {t.description && <p className="truncate text-xs text-muted">{t.description}</p>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismissToast(t.id);
                }}
                className="shrink-0 border border-line px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-ink uppercase hover:border-ink"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="grid size-7 shrink-0 place-items-center text-muted hover:text-ink"
              aria-label="Dismiss"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
