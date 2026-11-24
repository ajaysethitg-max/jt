import { STATIC_BUILD } from "./runtime";

/**
 * Public address of the site, no trailing slash. Set at build time by the
 * GitHub workflow (custom domain, or https://user.github.io/repo) or with
 * NEXT_PUBLIC_SITE_URL in server mode.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

/** Absolute URL for a path or asset. Full http(s) links are returned unchanged. */
export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/** Absolute URL of a page, matching how it is really served (static export uses trailing slashes). */
export function pageUrl(path: string): string {
  const p = path === "/" ? "/" : path.replace(/\/+$/, "");
  return absUrl(STATIC_BUILD && p !== "/" ? `${p}/` : p);
}

/** Trim to a search-result-friendly length without cutting a word in half. */
export function clip(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Link used by "Get directions": the pasted Google Maps link, else a search by address. */
export function mapsLink(s: { mapUrl: string; address: string }): string {
  return s.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;
}
