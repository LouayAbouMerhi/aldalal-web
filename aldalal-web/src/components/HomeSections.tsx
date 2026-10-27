"use client";

import { useRecentProducts } from "@/lib/recent";
import { ProductRail } from "./ProductRail";
import { ClockIcon } from "./icons";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const items = useRecentProducts(exclude);
  if (items.length < 3) return null;
  return (
    <ProductRail
      title="Recently viewed"
      subtitle="Pick up where you left off"
      items={items}
      icon={<ClockIcon className="text-gold-500" />}
    />
  );
}
