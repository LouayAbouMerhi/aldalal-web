import { CategoryGrid } from "@/components/CategoryGrid";
import { RecentlyViewed } from "@/components/HomeSections";
import { Hero } from "@/components/Hero";
import { ProductRail } from "@/components/ProductRail";
import { homeCollections } from "@/config/collections";

export default function Home() {
  const rails = homeCollections();
  // One row only — the home page is a way in, not a second catalogue
  const featured = rails[0];
  const photos = rails
    .flatMap((r) => r.items)
    .filter((p) => p.image)
    .slice(0, 6)
    .map((p) => ({ src: p.image!.src, alt: p.name }));

  return (
    <>
      <Hero photos={photos} />
      <CategoryGrid />
      {featured && (
        <ProductRail key={featured.id} title={featured.title} subtitle={featured.subtitle} items={featured.items} href="/products" />
      )}
      <RecentlyViewed />
    </>
  );
}
