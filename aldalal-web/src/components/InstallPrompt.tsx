"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPersistentStore } from "@/lib/persist";
import { Modal } from "./Modal";
import { CheckIcon, CloseIcon, DownloadIcon, ShareIcon } from "./icons";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<(e: InstallEvent | null) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l(deferred));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l(null));
  });
}

function useInstallEvent() {
  const [event, setEvent] = useState<InstallEvent | null>(deferred);
  useEffect(() => {
    const listener = (e: InstallEvent | null) => setEvent(e);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return event;
}

async function install(event: InstallEvent) {
  await event.prompt();
  await event.userChoice;
  deferred = null;
  listeners.forEach((l) => l(null));
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

type Platform = "ios-safari" | "ios-other" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return /CriOS|FxiOS|EdgiOS|OPT\//.test(ua) ? "ios-other" : "ios-safari";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/**
 * Footer button. Uses the browser's own install prompt when it is offered,
 * and otherwise explains how to add the app by hand (iPhone has no install button).
 */
export function InstallButton() {
  const event = useInstallEvent();
  const [helpOpen, setHelpOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const check = () => setInstalled(isStandalone());
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", check);
    check();
    return () => mq.removeEventListener("change", check);
  }, []);

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (event ? install(event) : setHelpOpen(true))}
        className="inline-flex items-center gap-2 border border-line px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-ink uppercase transition hover:border-gold-400 hover:text-gold-700"
      >
        <DownloadIcon width={18} height={18} />
        Install app
      </button>
      <InstallHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function InstallHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="install-help-title"
      className="pop m-auto w-[min(100vw-2rem,28rem)] max-w-none bg-surface p-0 text-ink shadow-2xl"
    >
      <HelpContent onClose={onClose} />
    </Modal>
  );
}

function HelpContent({ onClose }: { onClose: () => void }) {
  const platform = detectPlatform();
  const secure = window.isSecureContext;

  const steps: Record<Platform, string[]> = {
    "ios-safari": [
      "Tap the Share button at the bottom of Safari (the square with an arrow).",
      "Scroll down and tap “Add to Home Screen”.",
      "Tap “Add” — the price list appears with your other apps.",
    ],
    "ios-other": [
      "Open this page in Safari (iPhone can only add apps from Safari).",
      "Tap the Share button, then “Add to Home Screen”.",
      "Tap “Add”.",
    ],
    android: [
      "Tap the ⋮ menu at the top right of the browser.",
      "Tap “Install app” or “Add to Home screen”.",
      "Confirm — the price list appears with your other apps.",
    ],
    desktop: [
      "Click the install icon at the right of the address bar (a screen with an arrow).",
      "Or open the ⋮ menu and choose “Install…”.",
      "The price list opens in its own window.",
    ],
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id="install-help-title" className="font-display flex items-center gap-2 text-xl text-ink">
          <ShareIcon className="text-gold-600" />
          Add to your home screen
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-paper"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <ol className="mt-4 grid gap-3">
        {steps[platform].map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      {!secure && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          You are viewing a local address. Installing and offline mode only work on the published site (an address that
          starts with https).
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <CheckIcon width={14} height={14} className="mt-0.5 shrink-0 text-forest-600" />
        Once added, it opens full screen and the products you have seen still work without internet.
      </p>
    </div>
  );
}

/** Remembers that the customer closed the install card. */
const installDismissed = createPersistentStore<boolean>("aldalal-install-dismissed", false, (raw) => raw === true);

/** Small card that invites the customer to install the app, once. */
export function InstallPrompt() {
  const event = useInstallEvent();
  const dismissed = installDismissed.use();

  const close = () => installDismissed.set(true);

  return (
    <AnimatePresence>
      {event && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed inset-x-3 bottom-24 z-40 flex items-center gap-3 border border-line bg-surface p-3 shadow-[0_24px_50px_-30px_rgb(36_30_26/0.7)] lg:right-6 lg:bottom-6 lg:left-auto lg:w-96"
        >
          <span className="grid size-11 shrink-0 place-items-center border border-line text-gold-700">
            <DownloadIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install the price list</p>
            <p className="text-xs text-muted">Add it to your home screen and browse offline.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              install(event);
              close();
            }}
            className="shrink-0 bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-paper uppercase hover:bg-wine-600"
          >
            Install
          </button>
          <button type="button" onClick={close} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper" aria-label="Not now">
            <CloseIcon width={16} height={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
