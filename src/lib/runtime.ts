/**
 * Hosting-mode flags shared by server and client code.
 * All values come from NEXT_PUBLIC_* so they are inlined at build time.
 */
export const STATIC_BUILD = process.env.NEXT_PUBLIC_STATIC_BUILD === "true";

/** Base path for GitHub Pages project sites ("" for root / custom domains). */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

/** Prefixes a root-relative asset path (e.g. a downloadable file) with the base path. */
export function localHref(path: string): string {
  return `${BASE_PATH}${path}`;
}
