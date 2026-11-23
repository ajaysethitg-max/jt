"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { readLocalReviews } from "@/lib/local-orders";
import { getRelated } from "@/lib/memory-catalog";
import { STATIC_BUILD } from "@/lib/runtime";
import { CATEGORY_LABELS, type Product, type Review } from "@/lib/types";
import { ProductCard } from "./product-card";
import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";
import { Reveal } from "./reveal";
import { ReviewsSection } from "./reviews-section";

/**
 * Product page. Prerendered with the build-time product, then re-bound to the
 * live catalogue so a Google Sheet price/deal change shows up immediately. It
 * also powers products added to the sheet after the site was built (see the
 * smart 404 page).
 */
export function ProductDetail({
  slug,
  product: initialProduct,
  reviews: initialReviews,
  related: initialRelated,
}: {
  slug: string;
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const { products, origin, reviewsBySku } = useCatalog();
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (STATIC_BUILD) setLocalReviews(readLocalReviews(initialProduct.sku));
  }, [initialProduct.sku]);

  const product = products.find((p) => p.slug === slug) ?? initialProduct;
  const liveReviews = useMemo(() => (origin === "live" ? reviewsBySku[product.sku] ?? [] : initialReviews), [origin, reviewsBySku, product.sku, initialReviews]);
  const reviews = useMemo(() => [...localReviews, ...liveReviews], [localReviews, liveReviews]);
  const related = useMemo(
    () => (origin === "live" ? getRelated(product, products, 4) : initialRelated),
    [origin, product, products, initialRelated],
  );

  const specPairs: [string, string][] = [
    ["Brand", product.brand],
    ["Category", CATEGORY_LABELS[product.category]],
    ["Storage", product.storage ?? ""],
    ["Display", product.screen ?? ""],
    ["Battery", product.battery ?? ""],
    ["Processor", product.processor ?? ""],
    ["Colours", product.colors.join(", ")],
    ["Warranty", product.warranty ?? ""],
    ["SKU", product.sku],
  ];
  const specs = specPairs.filter(([, v]) => v.trim() !== "");

  return (
    <div className="container-x py-6 sm:py-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-tq-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-tq-700">
          Products
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?c=${product.category}`} className="hover:text-tq-700">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="max-w-[16rem] truncate text-ink-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery key={product.sku} images={product.images} name={product.name} hasDeal={Boolean(product.deal)} />
        <PurchasePanel product={product} />
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Highlights</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Why you will love it</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">{product.shortDescription}</p>
          <p className="mt-3 text-base leading-relaxed text-ink-600">{product.description}</p>
          {product.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  href={`/products?q=${encodeURIComponent(t)}`}
                  className="inline-flex items-center gap-1 rounded-full bg-tq-50 px-3 py-1 text-xs font-bold text-tq-700 ring-1 ring-tq-100 hover:bg-tq-100"
                >
                  <Sparkles className="h-3 w-3" /> {t}
                </Link>
              ))}
            </div>
          )}
        </Reveal>
        <Reveal delay={100}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Specifications</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Technical details</h2>
          <dl className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-ink-100">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-3 text-sm">
                <dt className="font-semibold text-ink-500">{k}</dt>
                <dd className="font-semibold text-ink-800">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <ReviewsSection
        key={`${product.sku}-reviews`}
        product={product}
        reviews={reviews}
        onLocalReview={(r) => setLocalReviews((prev) => [r, ...prev])}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Pair it with</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">You may also like</h2>
            </div>
            <Link href="/products" className="hidden text-sm font-bold text-tq-700 hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.sku} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
