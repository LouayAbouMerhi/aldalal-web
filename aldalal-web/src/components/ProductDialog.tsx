"use client";

import { categoryById, type Product } from "@/lib/catalog";
import { cart, useCart } from "@/lib/cart";
import { productQuestion, whatsappUrl } from "@/lib/whatsapp";
import { Modal } from "./Modal";
import { Price } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { QtyStepper } from "./QtyStepper";
import { CartIcon, CloseIcon, PlusIcon, WhatsAppIcon } from "./icons";

type Props = {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
  onPickCategory: (id: string) => void;
};

export function ProductDialog({ product, onClose, onOpenCart, onPickCategory }: Props) {
  return (
    <Modal
      open={product !== null}
      onClose={onClose}
      labelledBy="product-dialog-title"
      className="pop m-auto w-[min(100vw-2rem,52rem)] max-w-none rounded-3xl bg-white p-0 shadow-2xl"
    >
      {product && <ProductDetails product={product} onOpenCart={onOpenCart} onPickCategory={onPickCategory} />}
    </Modal>
  );
}

function ProductDetails({
  product,
  onOpenCart,
  onPickCategory,
}: {
  product: Product;
  onOpenCart: () => void;
  onPickCategory: (id: string) => void;
}) {
  const qty = useCart()[product.id] ?? 0;
  const category = categoryById.get(product.category);

  return (
    <div className="relative grid md:grid-cols-2">
      <form method="dialog" className="absolute top-3 right-3 z-10">
        <button
          className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </form>

      <div className="border-b border-slate-100 p-4 md:border-r md:border-b-0 md:p-8">
        <ProductImage product={product} eager sizes="(min-width: 768px) 400px, 90vw" className="mx-auto max-w-[14rem] md:max-w-[22rem]" />
      </div>

      <div className="flex flex-col gap-4 p-5 md:p-8">
        {category && (
          <form method="dialog">
            <button
              onClick={() => onPickCategory(category.id)}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800 uppercase hover:bg-brand-100"
            >
              {category.name}
            </button>
          </form>
        )}
        <h2 id="product-dialog-title" className="pr-8 text-xl leading-snug font-semibold text-slate-900 md:text-2xl">
          {product.name}
        </h2>
        <div className="text-2xl">
          <Price price={product.price} />
        </div>
        {product.price === null && (
          <p className="text-sm text-slate-600">
            This item has no listed price. Add it to your order and we&apos;ll confirm the price on WhatsApp.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {qty > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} label={product.name} onChange={(q) => cart.setQty(product.id, q)} />
              <form method="dialog" className="flex-1">
                <button
                  onClick={onOpenCart}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
                >
                  <CartIcon />
                  View cart
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => cart.add(product.id)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 active:scale-[0.98]"
            >
              <PlusIcon />
              Add to cart
            </button>
          )}
          <a
            href={whatsappUrl(productQuestion(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full font-semibold text-wa-700 ring-1 ring-wa-600/40 hover:bg-green-50"
          >
            <WhatsAppIcon />
            {product.price === null ? "Ask for the price on WhatsApp" : "Ask about this on WhatsApp"}
          </a>
        </div>
      </div>
    </div>
  );
}
