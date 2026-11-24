"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { cn, discountPct, effectivePrice, formatInr } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_LIST, type ProductSummary } from "@/lib/types";
import { ProductCard } from "./product-card";

type SortKey = "popular" | "price-asc" | "price-desc" | "discount" | "rating";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "discount", label: "Biggest discount" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

type Params = Record<string, string | string[] | undefined>;

interface Filters {
  q: string;
  categories: string[];
  brands: string[];
  maxPrice: number;
  deals: boolean;
  inStock: boolean;
  sort: SortKey;
}

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));
const split = (v: string | string[] | undefined) =>
  str(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function readFilters(p: Params, absoluteMax: number): Filters {
  const max = Number(str(p.max));
  const sortKey = str(p.sort) as SortKey;
  return {
    q: str(p.q),
    categories: split(p.c),
    brands: split(p.b),
    maxPrice: Number.isFinite(max) && max > 0 ? Math.min(max, absoluteMax) : absoluteMax,
    deals: str(p.deals) === "1",
    inStock: str(p.stock) === "1",
    sort: SORTS.some((s) => s.key === sortKey) ? sortKey : "popular",
  };
}

function FilterPanel({
  filters,
  setFilters,
  brandList,
  absoluteMax,
  counts,
}: {
  filters: Filters;
  setFilters: (updater: (f: Filters) => Filters) => void;
  brandList: [string, number][];
  absoluteMax: number;
  counts: Record<string, number>;
}) {
  const toggle = (key: "categories" | "brands", value: string) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value] }));

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Category</p>
        <ul className="mt-3 space-y-2">
          {CATEGORY_LIST.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-700 hover:text-tq-700">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(c)}
                  onChange={() => toggle("categories", c)}
                  className="h-4 w-4 rounded border-ink-300 accent-tq-500"
                />
                <span className="flex-1">{CATEGORY_LABELS[c]}</span>
                <span className="tnum text-xs text-ink-400">{counts[c] ?? 0}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Brand</p>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {brandList.map(([b, n]) => (
            <li key={b}>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-700 hover:text-tq-700">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(b)}
                  onChange={() => toggle("brands", b)}
                  className="h-4 w-4 rounded border-ink-300 accent-tq-500"
                />
                <span className="flex-1">{b}</span>
                <span className="tnum text-xs text-ink-400">{n}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Max price</p>
          <span className="tnum rounded-full bg-tq-50 px-2.5 py-1 text-xs font-bold text-tq-700">
            {filters.maxPrice >= absoluteMax ? "Any" : formatInr(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={absoluteMax}
          step={absoluteMax > 50000 ? 1000 : 500}
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="mt-3 w-full"
          aria-label="Maximum price"
        />
        <div className="tnum mt-1 flex justify-between text-[11px] font-semibold text-ink-400">
          <span>₹0</span>
          <span>{formatInr(absoluteMax)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[1000, 5000, 10000, 30000, 50000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, maxPrice: v }))}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                filters.maxPrice === v ? "border-tq-500 bg-tq-500 text-white" : "border-ink-200 text-ink-600 hover:border-tq-400",
              )}
            >
              Under {formatInr(v)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-700">
          <input
            type="checkbox"
            checked={filters.deals}
            onChange={(e) => setFilters((f) => ({ ...f, deals: e.target.checked }))}
            className="h-4 w-4 rounded border-ink-300 accent-bp-500"
          />
          Deals of the day only
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink-700">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
            className="h-4 w-4 rounded border-ink-300 accent-tq-500"
          />
          In stock only
        </label>
      </div>
    </div>
  );
}

export function ProductBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products } = useCatalog();

  const params = useMemo<Params>(() => {
    const out: Params = {};
    searchParams.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }, [searchParams]);
  const queryString = searchParams.toString();

  const absoluteMax = useMemo(
    () => Math.max(1000, Math.ceil(Math.max(1000, ...products.map((p) => effectivePrice(p))) / 1000) * 1000),
    [products],
  );
  const [filters, setFilters] = useState<Filters>(() => readFilters(params, absoluteMax));
  const [drawer, setDrawer] = useState(false);

  // Remembers the URL this component wrote, so back/forward navigation can
  // restore filters without fighting the filter → URL effect below.
  const lastWritten = useRef<string>(queryString);

  const brandList = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => m.set(p.brand, (m.get(p.brand) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]) as [string, number][];
  }, [products]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    products.forEach((p) => (m[p.category] = (m[p.category] ?? 0) + 1));
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();
    const list = products.filter((p: ProductSummary) => {
      const price = effectivePrice(p);
      return (
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))) &&
        (filters.categories.length === 0 || filters.categories.includes(p.category)) &&
        (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
        price <= filters.maxPrice &&
        (!filters.deals || Boolean(p.deal)) &&
        (!filters.inStock || p.stock > 0)
      );
    });
    switch (filters.sort) {
      case "price-asc":
        return list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price-desc":
        return list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "rating":
        return list.sort((a, b) => b.rating * Math.log2(b.reviewCount + 2) - a.rating * Math.log2(a.reviewCount + 2));
      case "discount":
        return list.sort((a, b) => discountPct(b.mrp, effectivePrice(b)) - discountPct(a.mrp, effectivePrice(a)));
      default:
        return list.sort((a, b) => b.rating * Math.log2(b.reviewCount + 2) - a.rating * Math.log2(a.reviewCount + 2));
    }
  }, [products, filters]);

  // Filters → URL (shareable, back-button friendly)
  useEffect(() => {
    if (queryString !== lastWritten.current) return;
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    if (filters.categories.length) next.set("c", filters.categories.join(","));
    if (filters.brands.length) next.set("b", filters.brands.join(","));
    if (filters.maxPrice < absoluteMax) next.set("max", String(filters.maxPrice));
    if (filters.deals) next.set("deals", "1");
    if (filters.inStock) next.set("stock", "1");
    if (filters.sort !== "popular") next.set("sort", filters.sort);
    const qs = next.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    const t = setTimeout(() => {
      lastWritten.current = qs;
      router.replace(target, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [filters, absoluteMax, router, pathname, queryString]);

  // URL → filters (back/forward, or a link such as /products?deals=1)
  useEffect(() => {
    if (queryString === lastWritten.current) return;
    lastWritten.current = queryString;
    setFilters(readFilters(params, absoluteMax));
  }, [queryString, params, absoluteMax]);

  useEffect(() => {
    document.body.classList.toggle("locked", drawer);
    return () => document.body.classList.remove("locked");
  }, [drawer]);

  const activeChips: { label: string; clear: () => void }[] = [
    ...(filters.q ? [{ label: `"${filters.q}"`, clear: () => setFilters((f) => ({ ...f, q: "" })) }] : []),
    ...filters.categories.map((c) => ({
      label: CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c,
      clear: () => setFilters((f) => ({ ...f, categories: f.categories.filter((x) => x !== c) })),
    })),
    ...filters.brands.map((b) => ({ label: b, clear: () => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) })) })),
    ...(filters.maxPrice < absoluteMax
      ? [{ label: `Under ${formatInr(filters.maxPrice)}`, clear: () => setFilters((f) => ({ ...f, maxPrice: absoluteMax })) }]
      : []),
    ...(filters.deals ? [{ label: "Deals only", clear: () => setFilters((f) => ({ ...f, deals: false })) }] : []),
    ...(filters.inStock ? [{ label: "In stock", clear: () => setFilters((f) => ({ ...f, inStock: false })) }] : []),
  ];
  const isDefault = activeChips.length === 0 && filters.sort === "popular";
  const clearAll = () =>
    setFilters({ q: "", categories: [], brands: [], maxPrice: absoluteMax, deals: false, inStock: false, sort: "popular" });

  const title =
    filters.categories.length === 1
      ? CATEGORY_LABELS[filters.categories[0] as keyof typeof CATEGORY_LABELS]
      : filters.deals
        ? "Deals of the day"
        : "All products";

  return (
    <div className="container-x py-8 sm:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Jeet Telecom catalogue</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">
            Showing <span className="tnum font-bold text-ink-800">{filtered.length}</span> of {products.length} products ·
            genuine, with GST bill and brand warranty
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Search within results"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-tq-500"
              aria-label="Search products"
            />
          </div>
          <label className="relative flex items-center">
            <SlidersHorizontal className="pointer-events-none absolute left-4 h-4 w-4 text-ink-400" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))}
              className="appearance-none rounded-full border border-ink-200 bg-white py-2.5 pl-11 pr-10 text-sm font-semibold text-ink-800 outline-none focus:border-tq-500"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-4 h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-800 lg:hidden"
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilters((f) => ({ ...f, categories: [] }))}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
            filters.categories.length === 0 ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-tq-400",
          )}
        >
          All
        </button>
        {CATEGORY_LIST.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c],
              }))
            }
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
              filters.categories.includes(c) ? "border-tq-500 bg-tq-500 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-tq-400",
            )}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Active chips */}
      {!isDefault && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.clear}
              className="inline-flex items-center gap-1.5 rounded-full bg-bp-50 px-3 py-1 text-xs font-bold text-bp-700 ring-1 ring-bp-200 hover:bg-bp-100"
            >
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-bold uppercase tracking-wider text-ink-500 hover:text-tq-700">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              brandList={brandList}
              absoluteMax={absoluteMax}
              counts={counts}
            />
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-ink-200 bg-white py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-bp-50">
                <Search className="h-7 w-7 text-bp-500" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink-900">No products match these filters</h2>
              <p className="mt-2 max-w-sm text-sm text-ink-500">Try removing a filter or search for a brand like Apple, Samsung, boAt or Noise.</p>
              <button type="button" onClick={clearAll} className="mt-5 rounded-full bg-tq-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-tq-700">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.sku} product={p} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={cn("fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 lg:hidden", drawer ? "opacity-100" : "pointer-events-none opacity-0")}
        aria-hidden={!drawer}
      >
        <div className="absolute inset-0 bg-ink-950/45" onClick={() => setDrawer(false)} />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[85vw] max-w-sm overflow-y-auto bg-white p-5 shadow-lift transition-transform duration-300",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-2xl font-semibold text-ink-900">Filters</p>
            <button type="button" onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink-50" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            brandList={brandList}
            absoluteMax={absoluteMax}
            counts={counts}
          />
          <div className="mt-8 grid grid-cols-2 gap-2">
            <button type="button" onClick={clearAll} className="rounded-full border border-ink-200 py-3 text-sm font-bold text-ink-800">
              Reset
            </button>
            <button type="button" onClick={() => setDrawer(false)} className="rounded-full bg-tq-600 py-3 text-sm font-bold text-white hover:bg-tq-700">
              Show {filtered.length} products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shown until the URL filters are read on the client. */
export function ProductBrowserFallback() {
  return (
    <div className="container-x py-8 sm:py-10">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-ink-100" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-ink-100" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
    </div>
  );
}
