import { connection } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { deals, products, reviews, settings } from "@/db/schema";
import { getDemoBundle } from "@/data/demo-catalog";
import { bundleToMemoryCatalog, toTestimonials, type MemoryCatalog } from "./memory-catalog";
import { STATIC_BUILD } from "./runtime";
import { resolveSettings } from "./settings";
import { fetchBundleFromGoogleSheet, getSheetId } from "./sheet-parse";
import type { Category, DealInfo, Product, Review, SiteSettings, Testimonial } from "./types";

export { getBestsellers, getDeals, getFeatured, getRelated, sortByPopularity } from "./memory-catalog";

/* ------------------------------------------------------------------ */
/* Static build: catalogue compiled at build time (demo or the sheet)  */
/* ------------------------------------------------------------------ */

let memoryPromise: Promise<MemoryCatalog> | null = null;

function getMemory(): Promise<MemoryCatalog> {
  if (!memoryPromise) {
    memoryPromise = (async () => {
      let bundle = getDemoBundle();
      if (getSheetId()) {
        try {
          bundle = await fetchBundleFromGoogleSheet();
        } catch (e) {
          console.warn(`[catalog] Google Sheet unavailable at build time, using demo data: ${(e as Error).message}`);
        }
      }
      return bundleToMemoryCatalog(bundle, new Date());
    })().catch((e: unknown) => {
      memoryPromise = null;
      throw e;
    });
  }
  return memoryPromise;
}

/* ------------------------------------------------------------------ */
/* Server mode: Postgres via Drizzle                                   */
/* ------------------------------------------------------------------ */

type ProductRow = typeof products.$inferSelect;

export function mapProduct(row: ProductRow, dealMap: Map<string, DealInfo>): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category as Category,
    price: row.price,
    mrp: row.mrp,
    stock: row.stock,
    badge: row.badge,
    shortDescription: row.shortDescription,
    description: row.description,
    images: row.images ?? [],
    colors: row.colors ?? [],
    storage: row.storage,
    screen: row.screen,
    battery: row.battery,
    processor: row.processor,
    warranty: row.warranty,
    tags: row.tags ?? [],
    featured: row.featured,
    rating: Number(row.rating) || 0,
    reviewCount: row.reviewCount,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    deal: dealMap.get(row.sku) ?? null,
  };
}

export async function getActiveDealsMap(): Promise<Map<string, DealInfo>> {
  const now = new Date();
  const rows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.active, true), lte(deals.startsAt, now), gte(deals.endsAt, now)));
  const map = new Map<string, DealInfo>();
  for (const d of rows) {
    const existing = map.get(d.productSku);
    if (!existing || d.dealPrice < existing.dealPrice) {
      map.set(d.productSku, {
        id: d.id,
        label: d.label,
        dealPrice: d.dealPrice,
        startsAt: d.startsAt.toISOString(),
        endsAt: d.endsAt.toISOString(),
      });
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Catalogue access — same functions in both hosting modes             */
/* ------------------------------------------------------------------ */

export async function getAllProducts(): Promise<Product[]> {
  if (STATIC_BUILD) return (await getMemory()).products;
  let rows = await db.select().from(products).where(eq(products.isActive, true));
  if (rows.length === 0) {
    const { ensureSeeded } = await import("./sheet-sync");
    await ensureSeeded();
    rows = await db.select().from(products).where(eq(products.isActive, true));
  }
  const dealMap = await getActiveDealsMap();
  return rows.map((r) => mapProduct(r, dealMap));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (STATIC_BUILD) return (await getMemory()).products.find((p) => p.slug === slug) ?? null;
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  if (!rows[0]) return null;
  const dealMap = await getActiveDealsMap();
  return mapProduct(rows[0], dealMap);
}

export async function getReviewsForProduct(productId: number, sku?: string): Promise<Review[]> {
  if (STATIC_BUILD) {
    const catalog = await getMemory();
    const key = sku ?? catalog.products.find((p) => p.id === productId)?.sku ?? "";
    return catalog.reviewsBySku[key] ?? [];
  }
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getRecentReviews(limit = 6): Promise<Testimonial[]> {
  if (STATIC_BUILD) return toTestimonials(await getMemory(), limit);
  const rows = await db
    .select({
      id: reviews.id,
      author: reviews.author,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.images,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    createdAt: r.createdAt.toISOString(),
    productName: r.productName,
    productSlug: r.productSlug,
    productImage: r.productImage?.[0] ?? "",
  }));
}

export async function getSettings(): Promise<SiteSettings> {
  if (STATIC_BUILD) return (await getMemory()).settings;
  const rows = await db.select().from(settings);
  return resolveSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

/**
 * Called by the root layout. In server mode `connection()` opts every route
 * into request-time rendering so prices, stock and deal timers stay fresh.
 */
export async function getSettingsSafe(): Promise<SiteSettings> {
  if (STATIC_BUILD) return (await getMemory()).settings;
  await connection();
  try {
    return await getSettings();
  } catch {
    return resolveSettings({});
  }
}

/** Reviews grouped by SKU for the browser catalogue (static builds only). */
export async function getReviewsBySku(): Promise<Record<string, Review[]>> {
  if (!STATIC_BUILD) return {};
  return (await getMemory()).reviewsBySku;
}
