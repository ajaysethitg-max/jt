import { endOfDayIst, round2, slugify, startOfDayIst } from "./format";
import { resolveSettings } from "./settings";
import { normalizeBrand, normalizeCategory } from "./sheet-parse";
import type { CatalogBundle, Category, DealInfo, Product, Review, SiteSettings, Testimonial } from "./types";

/**
 * Database-free catalogue used by the static (GitHub Pages) build and by the
 * browser when it applies a live Google Sheet / CSV update.
 */
export interface MemoryCatalog {
  products: Product[];
  reviewsBySku: Record<string, Review[]>;
  settings: SiteSettings;
}

export function bundleToMemoryCatalog(bundle: CatalogBundle, now: Date = new Date()): MemoryCatalog {
  const t = now.getTime();

  const dealMap = new Map<string, DealInfo>();
  (bundle.deals ?? []).forEach((d, i) => {
    if (d.active === false) return;
    const startsAt = d.startsAt ?? startOfDayIst(now);
    const endsAt = d.endsAt ?? endOfDayIst(now);
    if (startsAt.getTime() > t || endsAt.getTime() <= t) return;
    const existing = dealMap.get(d.sku);
    if (!existing || d.dealPrice < existing.dealPrice) {
      dealMap.set(d.sku, {
        id: i + 1,
        label: d.label ?? null,
        dealPrice: d.dealPrice,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    }
  });

  const reviewsBySku: Record<string, Review[]> = {};
  (bundle.reviews ?? []).forEach((r, i) => {
    const key = r.sku.trim().toUpperCase();
    (reviewsBySku[key] ??= []).push({
      id: i + 1,
      author: r.author.trim(),
      rating: Math.min(5, Math.max(1, Math.round(r.rating))),
      title: r.title ?? "",
      body: r.body ?? "",
      verified: r.verified ?? true,
      createdAt: (r.date ?? now).toISOString(),
    });
  });

  const slugUses = new Map<string, number>();
  const products: Product[] = (bundle.products ?? []).map((row, index) => {
    let slug = slugify(row.slug?.trim() || row.name) || slugify(row.sku);
    const uses = (slugUses.get(slug) ?? 0) + 1;
    slugUses.set(slug, uses);
    if (uses > 1) slug = `${slug}-${uses}`;

    const sku = row.sku.trim().toUpperCase();
    const price = round2(row.price);
    const mrp = round2(row.mrp && row.mrp >= price ? row.mrp : price);
    const list = reviewsBySku[sku] ?? [];
    const rating = list.length ? Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10 : 4.5;

    return {
      id: index + 1,
      sku,
      slug,
      name: row.name.trim(),
      brand: normalizeBrand(row.brand || ""),
      category: normalizeCategory(row.category),
      price,
      mrp,
      stock: row.stock ?? 10,
      badge: row.badge ?? null,
      shortDescription: row.shortDescription ?? "",
      description: row.description ?? "",
      images: row.images?.length ? row.images : [],
      colors: row.colors ?? [],
      storage: row.storage ?? null,
      screen: row.screen ?? null,
      battery: row.battery ?? null,
      processor: row.processor ?? null,
      warranty: row.warranty ?? null,
      tags: row.tags ?? [],
      featured: Boolean(row.featured),
      rating,
      reviewCount: list.length,
      isActive: true,
      createdAt: now.toISOString(),
      deal: dealMap.get(sku) ?? null,
    };
  });

  return { products, reviewsBySku, settings: resolveSettings(bundle.settings ?? {}) };
}

export function toTestimonials(catalog: MemoryCatalog, limit = 6): Testimonial[] {
  const out: Testimonial[] = [];
  for (const p of catalog.products) {
    for (const r of catalog.reviewsBySku[p.sku] ?? []) {
      out.push({ ...r, productName: p.name, productSlug: p.slug, productImage: p.images[0] ?? "" });
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

/**
 * The demo "Deal of the Day" is baked at build time. On a static host with no
 * live source, move any deal from another day into today's window so the
 * countdown is always running when the shop opens in the morning.
 */
export function rollDealsToToday(products: Product[], now: Date = new Date()): Product[] {
  const nowMs = now.getTime();
  const tonight = endOfDayIst(now).getTime();
  return products.map((p) => {
    if (!p.deal) return p;
    // Still running and ends by tonight (midnight tomorrow)? Leave it alone —
    // otherwise a deal baked yesterday, or one that lapsed at midnight, is
    // moved into today's window.
    const ends = new Date(p.deal.endsAt).getTime();
    if (ends > nowMs && ends <= tonight) return p;
    return {
      ...p,
      deal: { ...p.deal, startsAt: startOfDayIst(now).toISOString(), endsAt: endOfDayIst(now).toISOString() },
    };
  });
}

/* ------------------------- Pure list helpers ------------------------- */

export function sortByPopularity<T extends { rating: number; reviewCount: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.rating * Math.log2(b.reviewCount + 2) - a.rating * Math.log2(a.reviewCount + 2));
}

export function getFeatured<T extends Product>(list: T[], limit = 8): T[] {
  return sortByPopularity(list.filter((p) => p.featured)).slice(0, limit);
}

export function getBestsellers<T extends Product>(list: T[], limit = 8): T[] {
  return sortByPopularity(list).slice(0, limit);
}

export function getRelated<T extends Product>(product: T, list: T[], limit = 4): T[] {
  const others = list.filter((p) => p.sku !== product.sku);
  const sameCategory = others.filter((p) => p.category === product.category);
  const sameBrand = sameCategory.filter((p) => p.brand === product.brand);
  const rest = [
    ...sameCategory.filter((p) => p.brand !== product.brand),
    ...others.filter((p) => p.category !== product.category),
  ];
  return [...sameBrand, ...rest].slice(0, limit);
}

export function getDeals<T extends Product>(list: T[]): T[] {
  return list
    .filter((p) => p.deal)
    .sort((a, b) => (b.deal ? b.mrp - b.deal.dealPrice : 0) - (a.deal ? a.mrp - a.deal.dealPrice : 0));
}
