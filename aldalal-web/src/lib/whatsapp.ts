import { site } from "@/config/site";
import { formatPrice, type Product } from "./catalog";
import type { CartLine } from "./cart";

export type CustomerInfo = { name: string; address: string; note: string };

export function whatsappUrl(text: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(
  summary: { lines: CartLine[]; pieces: number; subtotal: number; unpriced: number },
  customer: CustomerInfo,
) {
  const out: string[] = [`Hello ${site.name}, I'd like to place an order:`, ""];

  summary.lines.forEach(({ product, qty, lineTotal }, i) => {
    out.push(`${i + 1}. ${product.name}`);
    out.push(
      product.price === null
        ? `   Qty ${qty} × price to confirm`
        : `   Qty ${qty} × ${formatPrice(product.price)} = ${formatPrice(lineTotal ?? 0)}`,
    );
  });

  out.push("");
  out.push(`Products: ${summary.lines.length} (${summary.pieces} pcs)`);
  let total = `*Subtotal: ${formatPrice(summary.subtotal)}*`;
  if (summary.unpriced > 0) {
    total += ` + ${summary.unpriced} ${summary.unpriced === 1 ? "item" : "items"} (price to confirm)`;
  }
  out.push(total);

  const name = customer.name.trim();
  const address = customer.address.trim();
  const note = customer.note.trim();
  if (name || address || note) out.push("");
  if (name) out.push(`Name: ${name}`);
  if (address) out.push(`Address: ${address}`);
  if (note) out.push(`Note: ${note}`);

  return out.join("\n");
}

export function productQuestion(product: Product) {
  const ask = product.price === null ? "What is the price of" : "Is this available";
  return product.price === null
    ? `Hello ${site.name}, ${ask}: ${product.name}?`
    : `Hello ${site.name}, ${ask}: ${product.name} (${formatPrice(product.price)})?`;
}
