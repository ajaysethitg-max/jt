import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, getRelated, getReviewsForProduct, getSettingsSafe } from "@/lib/catalog";
import { JsonLd } from "@/components/json-ld";
import { effectivePrice, formatInr } from "@/lib/format";
import { absUrl, clip, pageUrl } from "@/lib/seo";
import { ProductDetail } from "@/components/product-detail";

/**
 * Shared product page. It is wired up by two thin entry files:
 *  - page.server.tsx → server mode: always rendered per request (fresh prices)
 *  - page.static.tsx → GitHub Pages: prerendered for every product at build
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateProductMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettingsSafe()]);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const price = effectivePrice(product);
  const url = pageUrl(`/products/${product.slug}`);
  const title = `${product.name} — best price in Dehradun`;
  const base = clip(product.shortDescription || product.description, 95);
  const description = clip(`${base} Buy at ${formatInr(price)} from ${settings.siteName}, Dehradun. Free gift & 0% EMI.`);
  const image = absUrl(product.images[0] ?? "/images/hero.jpg");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      locale: "en_IN",
      url,
      title: product.name,
      description,
      images: [{ url: image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: [image] },
  };
}

export async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, all, settings] = await Promise.all([getProductBySlug(slug), getAllProducts(), getSettingsSafe()]);
  if (!product) notFound();
  const reviews = await getReviewsForProduct(product.id, product.sku);
  const url = pageUrl(`/products/${product.slug}`);
  const price = effectivePrice(product);
  const published = (d: string) => {
    const t = new Date(d);
    return Number.isNaN(t.getTime()) ? {} : { datePublished: t.toISOString().slice(0, 10) };
  };
  const dealEnd = product.deal ? new Date(product.deal.endsAt) : null;
  const productLd = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description || product.shortDescription,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(product.images.length ? { image: product.images.map((i) => absUrl(i)) } : {}),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(dealEnd && !Number.isNaN(dealEnd.getTime()) ? { priceValidUntil: dealEnd.toISOString().slice(0, 10) } : {}),
      seller: { "@type": "Organization", name: settings.siteName },
    },
    ...(product.reviewCount > 0 && product.rating > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    ...(reviews.length
      ? {
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.body,
            ...published(r.createdAt),
          })),
        }
      : {}),
  };
  const crumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: pageUrl("/") },
      { "@type": "ListItem", position: 2, name: "Products", item: pageUrl("/products") },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };
  return (
    <>
      <JsonLd graph={[productLd, crumbs]} />
      <ProductDetail
        key={product.sku}
        slug={product.slug}
        product={product}
        reviews={reviews}
        related={getRelated(product, all, 4)}
      />
    </>
  );
}
