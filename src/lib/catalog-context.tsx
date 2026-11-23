"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { bundleToMemoryCatalog, rollDealsToToday, toTestimonials } from "./memory-catalog";
import { STATIC_BUILD } from "./runtime";
import { detectLiveSource, fetchLiveBundle, liveSourceKey } from "./sheet-parse";
import type { Product, Review, SiteSettings, Testimonial } from "./types";

export interface CatalogSnapshot {
  products: Product[];
  settings: SiteSettings;
  testimonials: Testimonial[];
  reviewsBySku: Record<string, Review[]>;
}

interface CatalogContextValue extends CatalogSnapshot {
  /** prerender = built-in data · demo = demo with daily deals · live = Google Sheet / CSV applied */
  origin: "prerender" | "demo" | "live";
  /** True once the browser has finished its first catalogue load. */
  ready: boolean;
  refresh: () => Promise<boolean>;
  clearCache: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);
const CACHE_PREFIX = "jeet-catalog-v1:";

function asSnapshot(raw: unknown): CatalogSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<CatalogSnapshot>;
  if (!Array.isArray(r.products) || !r.settings || typeof r.settings !== "object") return null;
  return {
    products: r.products,
    settings: r.settings,
    testimonials: Array.isArray(r.testimonials) ? r.testimonials : [],
    reviewsBySku: r.reviewsBySku && typeof r.reviewsBySku === "object" ? r.reviewsBySku : {},
  };
}

/**
 * Serves the prerendered catalogue instantly, then (on static hosting) applies
 * the live Google Sheet / CSV catalogue in the browser and caches it, so new
 * products, prices, the logo and deal timers appear without redeploying.
 */
export function CatalogProvider({ initial, children }: { initial: CatalogSnapshot; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CatalogSnapshot | null>(null);
  const [origin, setOrigin] = useState<CatalogContextValue["origin"]>("prerender");
  const [ready, setReady] = useState(!STATIC_BUILD);
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const load = useCallback(async (): Promise<boolean> => {
    const base = initialRef.current;
    const source = detectLiveSource();
    if (!source) {
      setSnapshot({ ...base, products: rollDealsToToday(base.products) });
      setOrigin("demo");
      return false;
    }
    try {
      const catalog = bundleToMemoryCatalog(await fetchLiveBundle(source), new Date());
      const next: CatalogSnapshot = {
        products: catalog.products,
        settings: catalog.settings,
        testimonials: toTestimonials(catalog, 6),
        reviewsBySku: catalog.reviewsBySku,
      };
      try {
        window.localStorage.setItem(CACHE_PREFIX + liveSourceKey(source), JSON.stringify(next));
      } catch {
        // storage may be full or blocked — not critical
      }
      setSnapshot(next);
      setOrigin("live");
      return true;
    } catch (e) {
      console.warn("[catalog] live update failed:", (e as Error).message);
      let cached: CatalogSnapshot | null = null;
      try {
        const raw = window.localStorage.getItem(CACHE_PREFIX + liveSourceKey(source));
        if (raw) cached = asSnapshot(JSON.parse(raw));
      } catch {
        // ignore corrupt cache
      }
      if (cached) {
        setSnapshot(cached);
        setOrigin("live");
      } else {
        setSnapshot({ ...base, products: rollDealsToToday(base.products) });
        setOrigin("demo");
      }
      return false;
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!STATIC_BUILD) return;
    // Show the last good copy straight away, then refresh in the background.
    const source = detectLiveSource();
    if (source) {
      try {
        const raw = window.localStorage.getItem(CACHE_PREFIX + liveSourceKey(source));
        const cached = raw ? asSnapshot(JSON.parse(raw)) : null;
        if (cached) {
          setSnapshot(cached);
          setOrigin("live");
        }
      } catch {
        // ignore corrupt cache
      }
    }
    load().finally(() => setReady(true));
  }, [load]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      ...(snapshot ?? initial),
      origin,
      ready,
      refresh: load,
      clearCache,
    }),
    [snapshot, initial, origin, ready, load, clearCache],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
