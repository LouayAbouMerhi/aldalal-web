"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/config/site";
import type { Product } from "@/lib/catalog";
import { watermarkUrl } from "@/lib/watermark";
import { Modal } from "./Modal";
import { CloseIcon, MinusIcon, PlusIcon, SearchIcon } from "./icons";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function PhotoZoom({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="zoom-title"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0"
    >
      <ZoomStage product={product} onClose={onClose} />
    </Modal>
  );
}

function ZoomStage({ product, onClose }: { product: Product; onClose: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const [scale, setScale] = useState(1);

  const apply = useCallback(() => {
    const { scale: s, x, y } = view.current;
    if (frame.current) frame.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
  }, []);

  /** Keeps the photo from being dragged off screen. */
  const clampPan = useCallback(() => {
    const box = stage.current?.getBoundingClientRect();
    if (!box) return;
    const limitX = (box.width * (view.current.scale - 1)) / 2;
    const limitY = (box.height * (view.current.scale - 1)) / 2;
    view.current.x = clamp(view.current.x, -limitX, limitX);
    view.current.y = clamp(view.current.y, -limitY, limitY);
  }, []);

  /** Zooms towards a point on screen, so what you aim at stays put. */
  const zoomTo = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const box = stage.current?.getBoundingClientRect();
      if (!box) return;
      const target = clamp(next, MIN_SCALE, MAX_SCALE);
      const cx = (clientX ?? box.left + box.width / 2) - box.left - box.width / 2;
      const cy = (clientY ?? box.top + box.height / 2) - box.top - box.height / 2;
      const current = view.current;
      current.x = cx - ((cx - current.x) * target) / current.scale;
      current.y = cy - ((cy - current.y) * target) / current.scale;
      current.scale = target;
      if (target === MIN_SCALE) {
        current.x = 0;
        current.y = 0;
      }
      clampPan();
      apply();
      setScale(target);
    },
    [apply, clampPan],
  );

  // Mouse wheel and trackpad pinch
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTo(view.current.scale * Math.exp(-e.deltaY / 400), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomTo]);

  // Keyboard: + - 0
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomTo(view.current.scale * 1.4);
      if (e.key === "-") zoomTo(view.current.scale / 1.4);
      if (e.key === "0") zoomTo(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const points = [...pointers.current.values()];

    // Two fingers: pinch to zoom
    if (points.length === 2) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (!pinch.current) {
        pinch.current = { distance, scale: view.current.scale };
        return;
      }
      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;
      zoomTo((pinch.current.scale * distance) / pinch.current.distance, midX, midY);
      return;
    }

    // One finger or the mouse: drag to move the photo when zoomed in
    if (view.current.scale > 1) {
      view.current.x += e.clientX - previous.x;
      view.current.y += e.clientY - previous.y;
      clampPan();
      apply();
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const toggleZoom = (e: React.MouseEvent) => {
    zoomTo(view.current.scale > 1.2 ? 1 : 2.5, e.clientX, e.clientY);
  };

  const photo = product.image?.large ?? product.image;

  return (
    <div className="flex h-full flex-col bg-paper">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <h2 id="zoom-title" className="font-display line-clamp-1 text-[15px] text-ink">
          {product.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center text-muted hover:text-ink"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </header>

      <div
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={toggleZoom}
        onContextMenu={site.protectPhotos ? (e) => e.preventDefault() : undefined}
        className={`no-save relative flex-1 touch-none overflow-hidden bg-surface ${scale > 1 ? "cursor-grab" : "cursor-zoom-in"}`}
      >
        <div
          ref={frame}
          style={site.protectPhotos ? ({ "--watermark": watermarkUrl } as CSSProperties) : undefined}
          className={`absolute inset-0 origin-center transition-transform duration-150 ease-out will-change-transform ${
            site.protectPhotos ? "watermark" : ""
          }`}
        >
          {photo && (
            <Image
              src={photo.src}
              alt={product.name}
              fill
              sizes="100vw"
              draggable={false}
              className="object-contain p-4 select-none"
              priority={false}
            />
          )}
        </div>
        {site.protectPhotos && <span className="photo-guard" aria-hidden />}
      </div>

      <footer className="flex items-center justify-center gap-2 border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => zoomTo(view.current.scale / 1.5)}
          disabled={scale <= MIN_SCALE}
          className="grid size-11 place-items-center border border-line text-ink transition hover:border-ink disabled:opacity-40"
          aria-label="Zoom out"
        >
          <MinusIcon />
        </button>
        <button
          type="button"
          onClick={() => zoomTo(1)}
          className="h-11 border border-line px-5 text-[11px] font-semibold tracking-[0.14em] text-muted tabular-nums uppercase transition hover:border-ink"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomTo(view.current.scale * 1.5)}
          disabled={scale >= MAX_SCALE}
          className="grid size-11 place-items-center bg-ink text-paper transition hover:bg-wine-600 disabled:opacity-40"
          aria-label="Zoom in"
        >
          <PlusIcon />
        </button>
        <p className="ml-3 hidden text-[11px] tracking-wide text-muted sm:block">
          <SearchIcon width={14} height={14} className="mr-1 inline" />
          Scroll or pinch to zoom · double-tap to fill · drag to move
        </p>
      </footer>
    </div>
  );
}
