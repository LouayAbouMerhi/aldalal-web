import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";
import { site } from "@/config/site";
import { categories, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: `All products | ${site.name}`,
  description: `Browse all ${products.length} products in ${categories.length} categories with photos and prices in USD.`,
};

export default function ProductsPage() {
  return <Catalog />;
}
