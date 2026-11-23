import { count } from "drizzle-orm";
import { eq, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { deals, products, reviews, settings, syncState } from "@/db/schema";
import { endOfDayIst, round2, slugify, startOfDayIst } from "./format";
import type { CatalogBundle, CatalogSource, SheetName, SyncCounts, SyncStateInfo } from "./types";

import {
  fetchBundleFromGoogleSheet,
  parseDealsCsv,
  parseProductsCsv,
  parseReviewsCsv,
  parseSettingsCsv,
} from "./sheet-parse";

export * from "./sheet-parse";

/* ------------------------------------------------------------------ */
/* Applying a bundle to Postgres                                       */
/* ------------------------------------------------------------------ */

export async function refreshProductRatings(): Promise<void> {
  await db.execute(sql`
    UPDATE products p
    SET rating = COALESCE(r.avg, p.rating),
        review_count = COALESCE(r.cnt, 0)
    FROM (
      SELECT product_id, AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS cnt
      FROM reviews GROUP BY product_id
    ) r
    WHERE r.product_id = p.id
  `);
}

export async function applyBundle(
  bundle: CatalogBundle,
  source: CatalogSource,
): Promise<{ counts: SyncCounts; errors: string[] }> {
  const errors: string[] = [];
  const seen: string[] = [];
  const slugUses = new Map<string, number>();

  for (const row of bundle.products) {
    let slug = slugify(row.slug?.trim() || row.name);
    if (!slug) slug = slugify(row.sku);
    const uses = (slugUses.get(slug) ?? 0) + 1;
    slugUses.set(slug, uses);
    if (uses > 1) slug = `${slug}-${uses}`;

    const base = {
      sku: row.sku.trim().toUpperCase(),
      slug,
      name: row.name.trim(),
      brand: row.brand,
      category: row.category,
      price: round2(row.price),
      mrp: round2(row.mrp && row.mrp >= row.price ? row.mrp : row.price),
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
      isActive: true,
      updatedAt: new Date(),
    };
    try {
      await db
        .insert(products)
        .values({ ...base, rating: 4.5, reviewCount: 0 })
        .onConflictDoUpdate({ target: products.sku, set: base });
      seen.push(base.sku);
    } catch (e) {
      errors.push(`${base.sku}: ${(e as Error).message}`);
    }
  }

  if (seen.length && source !== "import") {
    await db.update(products).set({ isActive: false }).where(notInArray(products.sku, seen));
  }

  let dealCount = 0;
  if (bundle.deals.length) {
    const known = new Set((await db.select({ sku: products.sku }).from(products)).map((x) => x.sku));
    await db.delete(deals).where(eq(deals.source, source));
    for (const d of bundle.deals) {
      const sku = d.sku.trim().toUpperCase();
      if (!known.has(sku)) {
        errors.push(`Deal skipped — SKU ${sku} is not in Products`);
        continue;
      }
      try {
        await db.insert(deals).values({
          productSku: sku,
          label: d.label ?? null,
          dealPrice: round2(d.dealPrice),
          startsAt: d.startsAt ?? startOfDayIst(),
          endsAt: d.endsAt ?? endOfDayIst(),
          active: d.active ?? true,
          source,
        });
        dealCount++;
      } catch (e) {
        errors.push(`Deal ${sku}: ${(e as Error).message}`);
      }
    }
  }

  let reviewCount = 0;
  if (bundle.reviews.length) {
    const idMap = new Map((await db.select({ id: products.id, sku: products.sku }).from(products)).map((x) => [x.sku, x.id]));
    await db.delete(reviews).where(eq(reviews.source, source));
    const values = bundle.reviews.flatMap((r) => {
      const productId = idMap.get(r.sku.trim().toUpperCase());
      if (!productId) {
        errors.push(`Review skipped — SKU ${r.sku} is not in Products`);
        return [];
      }
      return [
        {
          productId,
          sku: r.sku.trim().toUpperCase(),
          author: r.author.trim(),
          rating: Math.min(5, Math.max(1, Math.round(r.rating))),
          title: r.title?.trim() ?? "",
          body: r.body?.trim() ?? "",
          verified: r.verified ?? true,
          source,
          createdAt: r.date ?? new Date(),
        },
      ];
    });
    for (let i = 0; i < values.length; i += 200) {
      await db.insert(reviews).values(values.slice(i, i + 200));
    }
    reviewCount = values.length;
  }

  const settingEntries = Object.entries(bundle.settings);
  for (const [key, value] of settingEntries) {
    if (!key.trim()) continue;
    await db
      .insert(settings)
      .values({ key: key.trim(), value: String(value ?? ""), updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value ?? ""), updatedAt: new Date() } });
  }

  await refreshProductRatings();
  return { counts: { products: seen.length, deals: dealCount, reviews: reviewCount, settings: settingEntries.length }, errors };
}

/* ------------------------------------------------------------------ */
/* Sync state + entry points                                           */
/* ------------------------------------------------------------------ */

async function writeSyncState(input: {
  source: string;
  status: SyncStateInfo["status"];
  message: string;
  lastSyncAt: Date;
  counts: SyncCounts | null;
  errors?: string[];
}): Promise<SyncStateInfo> {
  const values = {
    source: input.source,
    status: input.status,
    message: input.message.slice(0, 500),
    lastSyncAt: input.lastSyncAt,
    counts: input.counts,
    errors: (input.errors ?? []).slice(0, 8),
  };
  await db.insert(syncState).values({ id: 1, ...values }).onConflictDoUpdate({ target: syncState.id, set: values });
  return { ...values, lastSyncAt: values.lastSyncAt.toISOString() };
}

export async function getSyncState(): Promise<SyncStateInfo> {
  const rows = await db.select().from(syncState).where(eq(syncState.id, 1)).limit(1);
  const r = rows[0];
  if (!r) return { source: "demo", status: "idle", message: "Not synced yet", lastSyncAt: null, counts: null, errors: [] };
  return {
    source: r.source,
    status: r.status as SyncStateInfo["status"],
    message: r.message,
    lastSyncAt: r.lastSyncAt ? r.lastSyncAt.toISOString() : null,
    counts: r.counts,
    errors: r.errors ?? [],
  };
}

export async function runSync(): Promise<SyncStateInfo> {
  const startedAt = new Date();
  try {
    const bundle = await fetchBundleFromGoogleSheet();
    const result = await applyBundle(bundle, "sheet");
    await db.update(deals).set({ active: false }).where(eq(deals.source, "demo"));
    return writeSyncState({
      source: "sheet",
      status: "success",
      message: result.errors.length
        ? `Synced from Google Sheet with ${result.errors.length} warning(s)`
        : "Synced from Google Sheet",
      lastSyncAt: startedAt,
      counts: result.counts,
      errors: result.errors,
    });
  } catch (e) {
    return writeSyncState({
      source: "sheet",
      status: "error",
      message: (e as Error)?.message ?? "Google Sheet sync failed",
      lastSyncAt: startedAt,
      counts: null,
    });
  }
}

export async function ensureSeeded(): Promise<boolean> {
  const rows = await db.select({ c: count() }).from(products);
  if (Number(rows[0]?.c ?? 0) > 0) return false;
  const { getDemoBundle } = await import("@/data/demo-catalog");
  const result = await applyBundle(getDemoBundle(), "demo");
  await writeSyncState({
    source: "demo",
    status: "success",
    message: "Demo catalog loaded — connect a Google Sheet to publish your own products",
    lastSyncAt: new Date(),
    counts: result.counts,
  });
  return true;
}

/** Keeps the demo "Deal of the Day" alive across midnight rollovers. */
export async function refreshDemoDeals(): Promise<void> {
  const state = await getSyncState();
  if (state.source === "sheet") return;
  const demoDeals = await db.select().from(deals).where(eq(deals.source, "demo"));
  if (!demoDeals.length) return;
  const allExpired = demoDeals.every((d) => d.endsAt.getTime() <= Date.now());
  if (!allExpired) return;
  await db.update(deals).set({ startsAt: startOfDayIst(), endsAt: endOfDayIst(), active: true }).where(eq(deals.source, "demo"));
}

/** Imports one sheet's CSV (pasted or uploaded) through the same pipeline as the live sheet. */
export async function importSheet(sheet: SheetName, csv: string): Promise<SyncStateInfo> {
  const bundle: CatalogBundle = { products: [], deals: [], reviews: [], settings: {} };
  const errors: string[] = [];
  if (sheet === "products") {
    const parsed = parseProductsCsv(csv);
    bundle.products = parsed.rows;
    errors.push(...parsed.errors);
    if (!parsed.rows.length) throw new Error(errors[0] ?? "No valid product rows found");
  } else if (sheet === "deals") {
    const parsed = parseDealsCsv(csv);
    bundle.deals = parsed.rows;
    errors.push(...parsed.errors);
    if (!parsed.rows.length) throw new Error(errors[0] ?? "No valid deal rows found");
  } else if (sheet === "reviews") {
    const parsed = parseReviewsCsv(csv);
    bundle.reviews = parsed.rows;
    errors.push(...parsed.errors);
    if (!parsed.rows.length) throw new Error(errors[0] ?? "No valid review rows found");
  } else {
    bundle.settings = parseSettingsCsv(csv);
    if (!Object.keys(bundle.settings).length) throw new Error("No settings rows found");
  }
  const result = await applyBundle(bundle, "import");
  const current = await getSyncState();
  const c = result.counts;
  return writeSyncState({
    source: current.source,
    status: "success",
    message: `Imported "${sheet}" sheet — ${c.products} products, ${c.deals} deals, ${c.reviews} reviews, ${c.settings} settings`,
    lastSyncAt: new Date(),
    counts: result.counts,
    errors: [...errors, ...result.errors].slice(0, 8),
  });
}

export async function reloadDemoData(): Promise<SyncStateInfo> {
  const { getDemoBundle } = await import("@/data/demo-catalog");
  const result = await applyBundle(getDemoBundle(), "demo");
  await db.update(deals).set({ active: true }).where(eq(deals.source, "demo"));
  return writeSyncState({
    source: "demo",
    status: "success",
    message: "Demo catalog reloaded",
    lastSyncAt: new Date(),
    counts: result.counts,
    errors: result.errors,
  });
}
