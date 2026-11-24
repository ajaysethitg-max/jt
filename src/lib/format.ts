export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Shifts a date so that its UTC getters expose the IST wall-clock time. */
export function shiftToIst(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

/** Builds a real Date from IST wall-clock components. */
export function fromIstWall(
  y: number,
  monthIndex: number,
  day: number,
  h = 0,
  m = 0,
  s = 0,
): Date {
  return new Date(Date.UTC(y, monthIndex, day, h, m, s) - IST_OFFSET_MS);
}

export function startOfDayIst(now: Date = new Date()): Date {
  const n = shiftToIst(now);
  return fromIstWall(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

export function endOfDayIst(now: Date = new Date()): Date {
  const n = shiftToIst(now);
  return fromIstWall(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1);
}

/** Accepts YYYY-MM-DD, YYYY-MM-DD HH:mm, HH:mm (today, IST), DD/MM/YYYY, or any ISO string. */
export function parseFlexibleDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;
  // "DAILY" / "DAILY 23:59" → every day, so a deal never goes stale in a static build.
  if (/^daily$/i.test(v)) return endOfDayIst();
  let daily = v.match(/^daily\s+(\d{1,2}):(\d{2})$/i);
  if (daily) {
    const n = shiftToIst(new Date());
    return fromIstWall(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), +daily[1], +daily[2], 0);
  }
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return fromIstWall(+m[1], +m[2] - 1, +m[3], 23, 59, 59);
  m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return fromIstWall(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
  m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const n = shiftToIst(new Date());
    return fromIstWall(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), +m[1], +m[2], 0);
  }
  m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return fromIstWall(+m[3], +m[2] - 1, +m[1], 23, 59, 59);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formats a Date as IST wall-clock "YYYY-MM-DD HH:mm". */
export function formatIstDateTime(date: Date): string {
  const n = shiftToIst(date);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getUTCFullYear()}-${p(n.getUTCMonth() + 1)}-${p(n.getUTCDate())} ${p(n.getUTCHours())}:${p(n.getUTCMinutes())}`;
}

export function formatInr(value: number): string {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function discountPct(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function effectivePrice(product: { price: number; deal: { dealPrice: number } | null }): number {
  return product.deal ? product.deal.dealPrice : product.price;
}

export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function titleCase(input: string): string {
  return input.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toProductSummary(product: ProductLike): ProductLike {
  return product;
}

type ProductLike = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  badge: string | null;
  shortDescription: string;
  description: string;
  images: string[];
  colors: string[];
  storage: string | null;
  screen: string | null;
  battery: string | null;
  processor: string | null;
  warranty: string | null;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  deal: { id: number; label: string | null; dealPrice: number; startsAt: string; endsAt: string } | null;
};

/** Strips the long description so list payloads stay light. */
export function stripDescription<T extends { description: string }>(product: T): Omit<T, "description"> {
  const { description: _omit, ...rest } = product;
  return rest;
}

/**
 * Turns a Google Drive share link into a direct image URL that an <img> can show
 * (the file must be shared as "Anyone with the link"). Other URLs and local
 * paths such as /images/hero.jpg are returned unchanged.
 */
export function normalizeImageUrl(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const m =
    v.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
    v.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([\w-]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : v;
}

/** "Best Mobile. Best Price." -> ["Best Mobile.", "Best Price."] */
export function splitTagline(t: string): string[] {
  return ((t ?? "").match(/[^.!?]+[.!?]*/g) ?? []).map((p) => p.trim()).filter(Boolean);
}

/** "Best Mobile. Best Price." -> "Best Mobile · Best Price" */
export function inlineTagline(t: string): string {
  return splitTagline(t).map((p) => p.replace(/[.!?]+$/, "")).join(" · ");
}
