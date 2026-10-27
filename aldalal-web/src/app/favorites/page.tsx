import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Saved products | ${site.name}`,
  description: "Products you saved from the ALDALAL price list, kept on this device.",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
