import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, getRelated, getReviewsForProduct } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";

/**
 * Shared product page. It is wired up by two thin entry files:
 *  - page.server.tsx → server mode: always rendered per request (fresh prices)
 *  - page.static.tsx → GitHub Pages: prerendered for every product at build
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateProductMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — best price in Dehradun`,
    description: product.shortDescription || product.description.slice(0, 160),
  };
}

export async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProductBySlug(slug), getAllProducts()]);
  if (!product) notFound();
  const reviews = await getReviewsForProduct(product.id, product.sku);
  return (
    <ProductDetail
      key={product.sku}
      slug={product.slug}
      product={product}
      reviews={reviews}
      related={getRelated(product, all, 4)}
    />
  );
}
