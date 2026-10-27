"use client";

import { useState } from "react";
import { site, whatsappDisplay } from "@/config/site";
import { formatPrice } from "@/lib/catalog";
import { cart, summarize, useCart } from "@/lib/cart";
import { orderMessage, whatsappUrl, type CustomerInfo } from "@/lib/whatsapp";
import { Modal } from "./Modal";
import { Price } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";
import { CartIcon, CloseIcon, TrashIcon, WhatsAppIcon } from "./icons";

const CUSTOMER_KEY = "aldalal-customer-v1";

function loadCustomer(): CustomerInfo {
  const empty = { name: "", address: "", note: "" };
  if (typeof window === "undefined") return empty;
  try {
    const saved = JSON.parse(window.localStorage.getItem(CUSTOMER_KEY) ?? "{}");
    return { name: saved.name ?? "", address: saved.address ?? "", note: "" };
  } catch {
    return empty;
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenProduct: (id: string) => void;
};

export function CartDrawer({ open, onClose, onOpenProduct }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="cart-title"
      className="sheet m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 shadow-2xl"
    >
      <CartContents onOpenProduct={onOpenProduct} />
    </Modal>
  );
}

function CartContents({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const state = useCart();
  const summary = summarize(state);
  // Rendered only while the drawer is open, so reading localStorage here is client-only
  const [customer, setCustomer] = useState<CustomerInfo>(loadCustomer);
  const [confirmClear, setConfirmClear] = useState(false);

  const update = (patch: Partial<CustomerInfo>) => {
    const next = { ...customer, ...patch };
    setCustomer(next);
    try {
      window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: next.name, address: next.address }));
    } catch {}
  };

  const empty = summary.lines.length === 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-4">
        <div>
          <h2 id="cart-title" className="font-display text-xl">
            Your order
          </h2>
          {!empty && (
            <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {summary.lines.length} {summary.lines.length === 1 ? "product" : "products"} · {summary.pieces} pcs
            </p>
          )}
        </div>
        <form method="dialog">
          <button className="grid size-10 place-items-center text-muted hover:text-ink" aria-label="Close cart">
            <CloseIcon />
          </button>
        </form>
      </header>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="grid size-16 place-items-center border border-line text-gold-700">
            <CartIcon width={28} height={28} />
          </div>
          <p className="font-display text-xl">Your order is empty</p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Add products from the price list, then send your order to us on WhatsApp.</p>
          <form method="dialog">
            <button className="mt-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.16em] text-paper uppercase hover:bg-wine-600">
              Browse products
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-line">
              {summary.lines.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex gap-3 px-5 py-3">
                  <form method="dialog" className="shrink-0">
                    <button
                      onClick={() => onOpenProduct(product.id)}
                      className="block w-16 overflow-hidden ring-1 ring-line"
                      aria-label={`View ${product.name}`}
                    >
                      <ProductImage product={product} sizes="64px" plain />
                    </button>
                  </form>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display line-clamp-2 text-[14px] leading-snug">{product.name}</p>
                      <button
                        type="button"
                        onClick={() => cart.remove(product.id)}
                        className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center text-muted/50 hover:text-wine-600"
                        aria-label={`Remove ${product.name}`}
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <QtyStepper size="sm" min={1} value={qty} label={product.name} onChange={(q) => cart.setQty(product.id, q)} />
                      <div className="text-right text-sm">
                        {lineTotal === null ? (
                          <Price price={null} />
                        ) : (
                          <>
                            <div className="font-display text-[15px] tabular-nums">{formatPrice(lineTotal)}</div>
                            {qty > 1 && <div className="text-xs text-muted tabular-nums">{formatPrice(product.price ?? 0)} each</div>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-end px-5 pb-2">
              {confirmClear ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">Remove all items?</span>
                  <button
                    type="button"
                    onClick={() => {
                      cart.clear();
                      setConfirmClear(false);
                    }}
                    className="bg-wine-600 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-paper uppercase hover:bg-wine-700"
                  >
                    Clear
                  </button>
                  <button type="button" onClick={() => setConfirmClear(false)} className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase hover:text-ink">
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmClear(true)} className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase underline-offset-4 hover:text-wine-600 hover:underline">
                  Clear cart
                </button>
              )}
            </div>

            <fieldset className="mx-5 mt-2 mb-5 grid gap-3 border border-line bg-surface p-4">
              <legend className="sr-only">Your details</legend>
              <p className="eyebrow">Your details <span className="tracking-normal normal-case">(optional)</span></p>
              <Field label="Name" value={customer.name} onChange={(v) => update({ name: v })} autoComplete="name" />
              <Field label="Address / area" value={customer.address} onChange={(v) => update({ address: v })} autoComplete="street-address" />
              <Field label="Note" value={customer.note} onChange={(v) => update({ note: v })} multiline />
            </fieldset>
          </div>

          <footer className="border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Subtotal</span>
              <span className="font-display text-2xl text-ink tabular-nums">{formatPrice(summary.subtotal)}</span>
            </div>
            {summary.unpriced > 0 && (
              <p className="mt-1 text-xs text-gold-700">
                + {summary.unpriced} {summary.unpriced === 1 ? "item" : "items"} without a listed price (we&apos;ll confirm on WhatsApp)
              </p>
            )}
            <a
              href={whatsappUrl(orderMessage(summary, customer))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 items-center justify-center gap-2 bg-forest-600 text-[12px] font-semibold tracking-[0.18em] text-paper uppercase transition hover:bg-forest-700"
            >
              <WhatsAppIcon />
              Send order on WhatsApp
            </a>
            <p className="mt-2 text-center text-xs text-muted">
              Opens WhatsApp with your order ready to send to {site.name}{" "}
              <span className="whitespace-nowrap">({whatsappDisplay})</span>.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const cls =
    "w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold-400";
  return (
    <label className="grid gap-1 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
      {label}
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className={cls} />
      )}
    </label>
  );
}
