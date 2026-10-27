import { products, productById, type Product } from "@/lib/catalog";

/**
 * Home page rails. Edit the product ids to change what is featured.
 * An id is the file-name style version of the product name, for example
 * "colgate-advanced-white-toothpaste-75ml" — you can copy it from a product page URL.
 * Ids that no longer exist in the price list are skipped automatically.
 */
export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  /** Fixed list of products. Leave out to use `auto`. */
  productIds?: string[];
  /** "best-value" = the cheapest products in the price list, one per category. */
  auto?: "best-value";
};

export const collections: Collection[] = [
  {
    id: "featured",
    title: "Featured this month",
    subtitle: "Brands our customers ask for most",
    productIds: [
      "dove-nutritive-solutions-daily-care-shampoo-400ml",
      "colgate-advanced-white-toothpaste-75ml",
      "gillette-antiperspirant-hydrating-gel-aloe-scent-75ml",
      "nivea-dry-comfort-anti-perspirant-roll-on-50ml",
      "rexona-advanced-protection-aloe-vera-antiperspirant-150ml",
      "l-oreal-elvive-dream-long-straight-shampoo-400ml",
      "dove-advanced-care-coconut-and-jasmine-flower-deodorant-spray-250ml",
      "colgate-charcoal-clean-gel-toothpaste-120g",
      "gillette-arctic-ice-antiperspirant-gel-75ml",
      "nivea-extra-bright-radiant-and-smooth-roll-on-deodorant-50ml",
      "rexona-advanced-protection-biorhythm-antiperspirant-150ml",
      "l-oreal-elvive-fall-resist-reinforcing-shampoo-400ml",
    ],
  },
  {
    id: "new",
    title: "New in the price list",
    subtitle: "Recently added to our shelves",
    productIds: [
      "garnier-ultra-doux-avocado-oil-and-shea-butter-shampoo-400ml",
      "axe-anarchy-for-him-deodorant-bodyspray-150ml",
      "lux-silky-gardenia-body-wash-500ml",
      "vatika-nourishing-protein-egg-shampoo-200ml",
      "garnier-ultra-dolce-bambini-2-in-1-lion-king-apricot-shampoo-400ml",
      "axe-africa-deodorant-body-spray-axe-gold-temptation-deodorant-body-150ml",
      "lux-soft-rose-body-wash-500ml",
      "vatika-henna-conditioning-shampoo-175ml",
    ],
  },
  {
    id: "value",
    title: "Best value",
    subtitle: "Lowest prices across the categories",
    auto: "best-value",
  },
];

/** Cheapest priced product from each category, cheapest first. */
function bestValue(limit = 12): Product[] {
  const cheapestPerCategory = new Map<string, Product>();
  for (const p of products) {
    if (p.price === null || !p.image) continue;
    const current = cheapestPerCategory.get(p.category);
    if (!current || p.price < (current.price ?? Infinity)) cheapestPerCategory.set(p.category, p);
  }
  return [...cheapestPerCategory.values()].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)).slice(0, limit);
}

export function collectionProducts(collection: Collection, exclude = new Set<string>()): Product[] {
  const list =
    collection.auto === "best-value"
      ? bestValue()
      : (collection.productIds ?? []).map((id) => productById.get(id)).filter((p): p is Product => !!p);
  return list.filter((p) => !exclude.has(p.id));
}

/** All rails, with each product appearing only once across them. */
export function homeCollections() {
  const used = new Set<string>();
  return collections
    .map((c) => {
      const items = collectionProducts(c, used);
      items.forEach((p) => used.add(p.id));
      return { ...c, items };
    })
    .filter((c) => c.items.length > 0);
}
