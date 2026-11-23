"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { getRelated } from "@/lib/memory-catalog";
import { ProductDetail } from "@/components/product-detail";

/**
 * Smart 404. GitHub Pages serves this page for any unknown address, so when a
 * product was added to the Google Sheet after the last deploy, its URL still
 * works: the live catalogue is checked and the product page is rendered.
 */
export default function NotFound() {
  return <SmartNotFound />;
}

function SmartNotFound() {
  const { products, ready } = useCatalog();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const candidate = parts[parts.length - 1];
    if (parts[parts.length - 2] === "products" && candidate) {
      try {
        setSlug(decodeURIComponent(candidate));
        return;
      } catch {
        // malformed URL — fall through to the regular 404
      }
    }
    setSlug("");
  }, []);

  const product = slug ? products.find((p) => p.slug === slug) : undefined;

  if (slug && !product && !ready) {
    return (
      <div className="container-x py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-tq-600" />
        <p className="mt-4 text-sm font-semibold text-ink-500">Checking the latest catalogue…</p>
      </div>
    );
  }

  if (slug && product) {
    return <ProductDetail key={product.sku} slug={product.slug} product={product} reviews={[]} related={getRelated(product, products, 4)} />;
  }

  return (
    <div className="container-x flex flex-col items-center py-24 text-center sm:py-32">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-tq-100 to-bp-100">
        <Search className="h-9 w-9 text-bp-500" />
      </span>
      <p className="mt-6 font-display text-7xl font-semibold text-tq-600 sm:text-8xl">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">This page slipped out of the box</h1>
      <p className="mt-3 max-w-md text-sm text-ink-500">
        The product or page you are looking for is not here. It may have sold out — but the best mobile at the best price is still waiting.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="shine inline-flex items-center gap-2 rounded-full bg-tq-600 px-7 py-3 text-sm font-bold text-white hover:bg-tq-700">
          Browse products <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/" className="rounded-full border border-ink-200 px-7 py-3 text-sm font-bold text-ink-800 hover:border-tq-400 hover:text-tq-700">
          Go home
        </Link>
      </div>
    </div>
  );
}
