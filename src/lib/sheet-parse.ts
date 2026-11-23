import { csvToObjects, toCsv } from "./csv";
import { endOfDayIst, formatIstDateTime, normalizeImageUrl, parseFlexibleDate, startOfDayIst, titleCase } from "./format";
import type { CatalogBundle, Category, DealRowInput, ProductRowInput, ReviewRowInput, SheetName } from "./types";

/* ------------------------------------------------------------------ */
/* Google Sheet configuration (shared by server sync and static site)  */
/* ------------------------------------------------------------------ */

export const SHEET_TABS: Record<SheetName, string> = {
  products: process.env.GOOGLE_SHEET_TAB_PRODUCTS || process.env.NEXT_PUBLIC_GOOGLE_SHEET_TAB_PRODUCTS || "Products",
  deals: process.env.GOOGLE_SHEET_TAB_DEALS || process.env.NEXT_PUBLIC_GOOGLE_SHEET_TAB_DEALS || "Deals",
  reviews: process.env.GOOGLE_SHEET_TAB_REVIEWS || process.env.NEXT_PUBLIC_GOOGLE_SHEET_TAB_REVIEWS || "Reviews",
  settings: process.env.GOOGLE_SHEET_TAB_SETTINGS || process.env.NEXT_PUBLIC_GOOGLE_SHEET_TAB_SETTINGS || "Settings",
};

export function getSheetId(): string {
  return (process.env.GOOGLE_SHEET_ID || "").trim();
}

export function isSheetConfigured(): boolean {
  return getSheetId().length > 0;
}

export const SHEET_HEADERS: Record<SheetName, string[]> = {
  products: [
    "SKU",
    "Name",
    "Brand",
    "Category",
    "Price",
    "MRP",
    "Stock",
    "Badge",
    "Short Description",
    "Description",
    "Images",
    "Colors",
    "Storage",
    "Screen",
    "Battery",
    "Processor",
    "Warranty",
    "Tags",
    "Featured",
    "Slug",
  ],
  deals: ["SKU", "Deal Price", "Label", "Starts At", "Ends At", "Active"],
  reviews: ["SKU", "Author", "Rating", "Title", "Body", "Verified", "Date"],
  settings: ["Key", "Value"],
};

const BRAND_NAMES: Record<string, string> = {
  apple: "Apple",
  samsung: "Samsung",
  oppo: "OPPO",
  vivo: "vivo",
  motorola: "Motorola",
  moto: "Motorola",
  realme: "realme",
  xiaomi: "Xiaomi",
  redmi: "Redmi",
  oneplus: "OnePlus",
  boat: "boAt",
  noise: "Noise",
  jbl: "JBL",
  anker: "Anker",
  ambrane: "Ambrane",
  spigen: "Spigen",
  jetech: "JETech",
  portronics: "Portronics",
  dyazo: "Dyazo",
  mivi: "Mivi",
  sony: "Sony",
  nothing: "Nothing",
  infinix: "Infinix",
  tecno: "Tecno",
  itel: "itel",
  lava: "Lava",
  ubon: "Ubon",
};

export function normalizeBrand(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (BRAND_NAMES[key]) return BRAND_NAMES[key];
  return raw.trim() ? titleCase(raw.trim()) : "Jeet Telecom";
}

export function normalizeCategory(raw: string | undefined): Category {
  const k = (raw || "").trim().toLowerCase();
  if (["mobile", "mobiles", "phone", "phones", "smartphone", "smartphones"].includes(k)) return "mobiles";
  if (["audio", "earbuds", "headphones", "speaker", "speakers", "earphone", "sound"].includes(k)) return "audio";
  if (["wearable", "wearables", "watch", "watches", "smartwatch", "band", "fitness"].includes(k)) return "wearables";
  return "accessories";
}

/* ------------------------------------------------------------------ */
/* Value helpers                                                       */
/* ------------------------------------------------------------------ */

export function num(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function int(v: string | undefined, fallback: number): number {
  const n = num(v);
  return n === null ? fallback : Math.round(n);
}

export function bool(v: string | undefined): boolean {
  if (!v) return false;
  return ["true", "yes", "y", "1", "featured", "on"].includes(v.trim().toLowerCase());
}

export function list(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* CSV → row parsers                                                   */
/* ------------------------------------------------------------------ */

export function parseProductsCsv(csv: string): { rows: ProductRowInput[]; errors: string[] } {
  const errors: string[] = [];
  const rows: ProductRowInput[] = [];
  csvToObjects(csv).forEach((o, i) => {
    const line = i + 2;
    const name = o.name?.trim();
    const sku = o.sku?.trim().toUpperCase();
    if (!name) {
      if (Object.values(o).some(Boolean)) errors.push(`Row ${line}: "Name" is required`);
      return;
    }
    if (!sku) {
      errors.push(`Row ${line}: "SKU" is required for "${name}"`);
      return;
    }
    const price = num(o.price);
    if (price === null) {
      errors.push(`Row ${line}: "Price" is missing or invalid for "${name}"`);
      return;
    }
    const mrp = num(o.mrp);
    rows.push({
      sku,
      slug: o.slug?.trim() || undefined,
      name,
      brand: normalizeBrand(o.brand || ""),
      category: normalizeCategory(o.category),
      price,
      mrp: mrp && mrp >= price ? mrp : price,
      stock: int(o.stock, 10),
      badge: o.badge?.trim() || null,
      shortDescription: o.shortdescription || "",
      description: o.description || "",
      images: list(o.images).map(normalizeImageUrl),
      colors: list(o.colors),
      storage: o.storage?.trim() || null,
      screen: o.screen?.trim() || null,
      battery: o.battery?.trim() || null,
      processor: o.processor?.trim() || null,
      warranty: o.warranty?.trim() || null,
      tags: list(o.tags),
      featured: bool(o.featured),
    });
  });
  return { rows, errors };
}

export function parseDealsCsv(csv: string): { rows: DealRowInput[]; errors: string[] } {
  const errors: string[] = [];
  const rows: DealRowInput[] = [];
  csvToObjects(csv).forEach((o, i) => {
    const sku = o.sku?.trim().toUpperCase();
    const dealPrice = num(o.dealprice);
    if (!sku || dealPrice === null) {
      if (Object.values(o).some(Boolean)) errors.push(`Deals row ${i + 2}: needs "SKU" and "Deal Price"`);
      return;
    }
    rows.push({
      sku,
      dealPrice,
      label: o.label?.trim() || null,
      startsAt: parseFlexibleDate(o.startsat) ?? startOfDayIst(),
      endsAt: parseFlexibleDate(o.endsat) ?? endOfDayIst(),
      active: o.active ? bool(o.active) : true,
    });
  });
  return { rows, errors };
}

export function parseReviewsCsv(csv: string): { rows: ReviewRowInput[]; errors: string[] } {
  const errors: string[] = [];
  const rows: ReviewRowInput[] = [];
  csvToObjects(csv).forEach((o, i) => {
    const sku = o.sku?.trim().toUpperCase();
    const author = o.author?.trim();
    const rating = int(o.rating, 0);
    if (!sku || !author || rating < 1 || rating > 5) {
      if (Object.values(o).some(Boolean)) errors.push(`Reviews row ${i + 2}: needs "SKU", "Author" and a 1–5 "Rating"`);
      return;
    }
    rows.push({
      sku,
      author,
      rating,
      title: o.title?.trim() || "",
      body: o.body?.trim() || "",
      verified: o.verified ? bool(o.verified) : true,
      date: parseFlexibleDate(o.date) ?? new Date(),
    });
  });
  return { rows, errors };
}

export function parseSettingsCsv(csv: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const o of csvToObjects(csv)) {
    const key = (o.key || "").trim().toLowerCase();
    if (key) out[key] = (o.value || "").trim();
  }
  return out;
}

/** Builds one bundle from raw tab contents (Products is mandatory). */
function assembleTabs(tabs: Partial<Record<SheetName, string>>): CatalogBundle {
  if (tabs.products === undefined) throw new Error("The Products tab could not be loaded");
  const parsed = parseProductsCsv(tabs.products);
  if (!parsed.rows.length) throw new Error("The Products sheet has no product rows");
  return {
    products: parsed.rows,
    deals: tabs.deals !== undefined ? parseDealsCsv(tabs.deals).rows : [],
    reviews: tabs.reviews !== undefined ? parseReviewsCsv(tabs.reviews).rows : [],
    settings: tabs.settings !== undefined ? parseSettingsCsv(tabs.settings) : {},
  };
}

/* ------------------------------------------------------------------ */
/* Bundle → CSV (template export)                                      */
/* ------------------------------------------------------------------ */

export function bundleToCsv(bundle: CatalogBundle, sheet: SheetName, now: Date = new Date()): string {
  switch (sheet) {
    case "products":
      return toCsv(
        SHEET_HEADERS.products,
        bundle.products.map((p) => [
          p.sku,
          p.name,
          p.brand,
          p.category,
          p.price,
          p.mrp ?? "",
          p.stock ?? 10,
          p.badge ?? "",
          p.shortDescription ?? "",
          p.description ?? "",
          p.images,
          p.colors ?? [],
          p.storage ?? "",
          p.screen ?? "",
          p.battery ?? "",
          p.processor ?? "",
          p.warranty ?? "",
          p.tags ?? [],
          p.featured ? "TRUE" : "FALSE",
          p.slug ?? "",
        ]),
      );
    case "deals": {
      const nowMs = now.getTime();
      const tonight = endOfDayIst(now).getTime();
      const todayStart = startOfDayIst(now).getTime();
      return toCsv(
        SHEET_HEADERS.deals,
        bundle.deals.map((d) => [
          d.sku,
          d.dealPrice,
          d.label ?? "",
          // Blank start = today 00:00; "DAILY" end = every night, so a deal
          // never goes stale. (Tonight's deadline is midnight *tomorrow*.)
          !d.startsAt || d.startsAt.getTime() <= todayStart ? "" : formatIstDateTime(d.startsAt),
          d.endsAt && d.endsAt.getTime() > nowMs && d.endsAt.getTime() <= tonight
            ? "DAILY"
            : d.endsAt
              ? formatIstDateTime(d.endsAt)
              : "",
          d.active === false ? "FALSE" : "TRUE",
        ]),
      );
    }
    case "reviews":
      return toCsv(
        SHEET_HEADERS.reviews,
        bundle.reviews.map((r) => [
          r.sku,
          r.author,
          r.rating,
          r.title,
          r.body,
          r.verified === false ? "FALSE" : "TRUE",
          r.date ? formatIstDateTime(r.date).slice(0, 10) : "",
        ]),
      );
    case "settings":
      return toCsv(
        SHEET_HEADERS.settings,
        Object.entries(bundle.settings).map(([k, v]) => [k, v]),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Server sync: public CSV export of a Google Sheet                   */
/* ------------------------------------------------------------------ */

export function sheetCsvUrl(sheetId: string, tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

function assertNotHtml(tab: string, text: string): string {
  if (text.trimStart().startsWith("<!") || text.includes("<html")) {
    throw new Error(`Tab "${tab}" is not public — share the sheet as "Anyone with the link · Viewer"`);
  }
  return text;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBundleFromGoogleSheet(): Promise<CatalogBundle> {
  const id = getSheetId();
  if (!id) throw new Error("GOOGLE_SHEET_ID is not configured");
  const names: SheetName[] = ["products", "deals", "reviews", "settings"];
  const results = await Promise.allSettled(names.map((n) => fetchSheetCsv(SHEET_TABS[n])));
  const tabs: Partial<Record<SheetName, string>> = {};
  names.forEach((n, i) => {
    const r = results[i];
    if (r.status === "fulfilled") tabs[n] = r.value;
  });
  if (results[0].status === "rejected") {
    throw new Error(`Products tab failed: ${(results[0].reason as Error)?.message ?? results[0].reason}`);
  }
  return assembleTabs(tabs);
}

async function fetchSheetCsv(tab: string): Promise<string> {
  const res = await fetchWithTimeout(sheetCsvUrl(getSheetId(), tab));
  if (!res.ok) throw new Error(`Google Sheet tab "${tab}" returned HTTP ${res.status}`);
  return assertNotHtml(tab, await res.text());
}

/* ------------------------------------------------------------------ */
/* Static hosting: live catalogue sources read from the browser       */
/* ------------------------------------------------------------------ */

export interface PublicSheetSource {
  kind: "sheet";
  id: string;
  /** Optional. With a key the official Sheets API is used; without it the public CSV export is. */
  apiKey: string;
  tabs: Record<SheetName, string>;
}

export interface CsvSource {
  kind: "csv";
  /** Folder holding products.csv, deals.csv, reviews.csv and settings.csv (e.g. raw GitHub URL). */
  base: string;
}

export type LiveSource = PublicSheetSource | CsvSource;

export function liveSourceKey(source: LiveSource): string {
  return source.kind === "sheet" ? `sheet:${source.id}` : `csv:${source.base}`;
}

/** 1) Google Sheet · 2) CSV files in the repo · 3) none (built-in demo catalogue). */
export function detectLiveSource(): LiveSource | null {
  const id = (process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "").trim();
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || "").trim();
  if (id) return { kind: "sheet", id, apiKey, tabs: SHEET_TABS };
  const base = (process.env.NEXT_PUBLIC_CATALOG_CSV_BASE_URL || "").trim().replace(/\/+$/, "");
  if (base) return { kind: "csv", base };
  return null;
}

async function fetchBundleFromPublicSheet(source: PublicSheetSource): Promise<CatalogBundle> {
  const names: SheetName[] = ["products", "deals", "reviews", "settings"];
  const results = await Promise.allSettled(
    names.map(async (n) => {
      const res = await fetchWithTimeout(`${sheetCsvUrl(source.id, source.tabs[n])}&t=${Date.now()}`);
      if (!res.ok) throw new Error(`Sheet tab "${source.tabs[n]}" returned HTTP ${res.status}`);
      return assertNotHtml(source.tabs[n], await res.text());
    }),
  );
  if (results[0].status === "rejected") {
    throw new Error(`Products tab failed: ${(results[0].reason as Error)?.message ?? results[0].reason}`);
  }
  const tabs: Partial<Record<SheetName, string>> = {};
  names.forEach((n, i) => {
    const r = results[i];
    if (r.status === "fulfilled") tabs[n] = r.value;
  });
  return assembleTabs(tabs);
}

async function fetchBundleFromSheetsApi(source: PublicSheetSource): Promise<CatalogBundle> {
  const names: SheetName[] = ["products", "deals", "reviews", "settings"];
  const getTab = async (tab: string): Promise<string> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${source.id}/values/${encodeURIComponent(tab)}?key=${encodeURIComponent(source.apiKey)}`;
    const res = await fetchWithTimeout(url);
    const data = (await res.json().catch(() => null)) as { values?: unknown; error?: { message?: string } } | null;
    if (!res.ok) throw new Error(`Sheet tab "${tab}": ${data?.error?.message ?? `HTTP ${res.status}`}`);
    const values = Array.isArray(data?.values) ? (data.values as unknown[][]) : [];
    if (!values.length) return "";
    return toCsv(values[0].map(String), values.slice(1).map((row) => row.map(String)));
  };
  const results = await Promise.allSettled(names.map((n) => getTab(source.tabs[n])));
  if (results[0].status === "rejected") {
    throw new Error(`Products tab failed: ${(results[0].reason as Error)?.message ?? results[0].reason}`);
  }
  const tabs: Partial<Record<SheetName, string>> = {};
  names.forEach((n, i) => {
    const r = results[i];
    if (r.status === "fulfilled") tabs[n] = r.value;
  });
  return assembleTabs(tabs);
}

async function fetchBundleFromCsvBase(base: string): Promise<CatalogBundle> {
  const getFile = async (name: string): Promise<string> => {
    // No cache-busting: raw.githubusercontent.com's CDN caches for ~5 minutes,
    // which keeps GitHub's endpoints happy and is fresh enough for a catalogue.
    const res = await fetchWithTimeout(`${base}/${name}.csv`);
    if (!res.ok) throw new Error(`${name}.csv returned HTTP ${res.status}`);
    return res.text();
  };
  const products = await getFile("products");
  const [deals, reviews, settings] = await Promise.allSettled([getFile("deals"), getFile("reviews"), getFile("settings")]);
  return assembleTabs({
    products,
    deals: deals.status === "fulfilled" ? deals.value : undefined,
    reviews: reviews.status === "fulfilled" ? reviews.value : undefined,
    settings: settings.status === "fulfilled" ? settings.value : undefined,
  });
}

export function fetchLiveBundle(source: LiveSource): Promise<CatalogBundle> {
  if (source.kind === "csv") return fetchBundleFromCsvBase(source.base);
  return source.apiKey ? fetchBundleFromSheetsApi(source) : fetchBundleFromPublicSheet(source);
}
