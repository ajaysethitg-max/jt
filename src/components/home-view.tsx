"use client";

import { useMemo } from "react";
import { useCatalog } from "@/lib/catalog-context";
import { getBestsellers, getDeals, getFeatured } from "@/lib/memory-catalog";
import {
  BrandMarquee,
  Collections,
  DealOfDay,
  FeaturedProducts,
  Finance,
  FreeGifts,
  Hero,
  InstagramStrip,
  StoreVisit,
  Testimonials,
  TrustStrip,
} from "./home-sections";

/**
 * Home page. Reads the catalogue from the provider so a Google Sheet update
 * (on static hosting) changes prices, deals, the logo and gifts instantly.
 */
export function HomeView() {
  const { products, settings, testimonials } = useCatalog();

  const data = useMemo(() => {
    const deals = getDeals(products);
    const featured = getFeatured(products, 8);
    const featuredSkus = new Set(featured.map((p) => p.sku));
    return {
      deals,
      featured,
      bestsellers: getBestsellers(
        products.filter((p) => !featuredSkus.has(p.sku)),
        4,
      ),
      counts: products.reduce<Record<string, number>>((acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      }, {}),
      insta: [...new Set(products.map((p) => p.images[0]).filter((s): s is string => Boolean(s)))].slice(0, 6),
    };
  }, [products]);

  return (
    <>
      <Hero settings={settings} deal={data.deals[0] ?? null} />
      <TrustStrip settings={settings} />
      <DealOfDay deals={data.deals} />
      <Collections counts={data.counts} images={settings.collectionImages} />
      <BrandMarquee brands={settings.brands} />
      <FeaturedProducts products={data.featured} />
      <FreeGifts gifts={settings.freeGifts} images={settings.giftImages} />
      <div className="bg-gradient-to-b from-white to-tq-50/50">
        <FeaturedProducts products={data.bestsellers} title="Dehradun's favourites" eyebrow="Bestsellers this week" />
      </div>
      <Finance partners={settings.financePartners} />
      <Testimonials reviews={testimonials} />
      <StoreVisit settings={settings} />
      <InstagramStrip images={data.insta} settings={settings} />
    </>
  );
}
