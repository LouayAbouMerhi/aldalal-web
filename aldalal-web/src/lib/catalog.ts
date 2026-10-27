import data from "@/data/products.json";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  /** Bigger, sharpened copy for the product page and the zoom view. */
  large?: { src: string; width: number; height: number };
};

export type Product = {
  id: string;
  name: string;
  /** USD. `null` means the price list has no price ("Ask for price"). */
  price: number | null;
  category: string;
  image: ProductImage | null;
};

export type Category = { id: string; name: string; count: number };

export type SortKey = "default" | "name" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Category order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const products = data.products as Product[];
export const categories = data.categories as Category[];
export const lastUpdated = data.generatedAt;

export const productById = new Map(products.map((p) => [p.id, p]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatPrice(value: number) {
  return priceFormatter.format(value);
}

/** Lowercase, strip accents and punctuation, collapse whitespace. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, " ")
    .trim();
}

// Pre-built search text: spaced form ("400 ml") and compact form ("400ml")
const searchIndex = new Map(
  products.map((p) => {
    const text = normalize(`${p.name} ${categoryById.get(p.category)?.name ?? ""}`);
    return [p.id, `${text} | ${text.replace(/ /g, "")}`];
  }),
);

export function searchTokens(query: string) {
  return normalize(query).split(" ").filter(Boolean);
}

export function matches(product: Product, tokens: string[]) {
  if (tokens.length === 0) return true;
  const haystack = searchIndex.get(product.id) ?? "";
  return tokens.every((t) => haystack.includes(t));
}

const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));

export function sortProducts(list: Product[], sort: SortKey) {
  if (sort === "default") return list;
  const copy = [...list];
  if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price-asc" || sort === "price-desc") {
    const dir = sort === "price-asc" ? 1 : -1;
    copy.sort((a, b) => {
      // Items without a price always go last
      if (a.price === null && b.price === null) return a.name.localeCompare(b.name);
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir || a.name.localeCompare(b.name);
    });
  }
  return copy;
}

export function isValidCategory(id: string | null): id is string {
  return !!id && categoryOrder.has(id);
}

export function isValidSort(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.value === value);
}
