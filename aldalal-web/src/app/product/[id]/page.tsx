import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { site } from "@/config/site";
import { categoryById, formatPrice, productById, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) return { title: `Product not found | ${site.name}` };

  const category = categoryById.get(product.category)?.name ?? "";
  const price = product.price === null ? "Ask for price" : formatPrice(product.price);
  const description = `${product.name} — ${price}. ${category} from ${site.fullName}, ${site.address}.`;

  return {
    title: `${product.name} | ${site.name}`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.image ? [{ url: product.image.src, width: product.image.width, height: product.image.height, alt: product.name }] : undefined,
    },
  };
}

/** Same category first, then whatever is closest in price. */
function relatedProducts(id: string) {
  const product = productById.get(id);
  if (!product) return [];
  const brand = product.name.split(" ")[0].toLowerCase();
  return products
    .filter((p) => p.id !== id && p.category === product.category)
    .sort((a, b) => {
      const brandScore = (p: typeof a) => (p.name.toLowerCase().startsWith(brand) ? 0 : 1);
      if (brandScore(a) !== brandScore(b)) return brandScore(a) - brandScore(b);
      const price = product.price ?? 0;
      return Math.abs((a.price ?? 0) - price) - Math.abs((b.price ?? 0) - price);
    })
    .slice(0, 12);
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) notFound();

  return <ProductView product={product} related={relatedProducts(id)} />;
}
