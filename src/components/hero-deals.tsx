"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import { cn, discountPct, formatInr } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { Countdown } from "./countdown";
import { SmartImage } from "./smart-image";

/**
 * Big "Deal of the day" card shown on the right of the home-page hero.
 * With several active deals it rotates between them (up to 3) every 6 seconds.
 */
export function HeroDeals({ deals }: { deals: Product[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = deals.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n, paused]);

  const d = deals[i] ?? deals[0];
  if (!d || !d.deal) return null;
  const price = d.deal.dealPrice;
  const off = discountPct(d.mrp, price);

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink-900 shadow-lift ring-1 ring-ink-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {deals.map((p, idx) => (
        <SmartImage
          key={p.sku}
          src={p.images[0] ?? "/images/hero.jpg"}
          alt={idx === i ? p.name : ""}
          fill
          sizes="(max-width: 1024px) 90vw, 45vw"
          className={cn("object-cover transition-opacity duration-700", idx === i ? "opacity-100" : "opacity-0")}
          priority={idx === 0}
        />
      ))}

      <Link href={`/products/${d.slug}`} className="absolute inset-0" aria-label={d.name} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />

      <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-bp-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-pink sm:left-5 sm:top-5">
        <Zap className="h-3.5 w-3.5" fill="currentColor" /> {d.deal.label ?? "Deal of the day"}
      </span>
      <span className="tnum pointer-events-none absolute right-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-ink-900 sm:right-5 sm:top-5">
        {off}% OFF
      </span>

      <div key={d.sku} className="pointer-events-none absolute inset-x-0 bottom-0 animate-fade-up p-4 text-white sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-tq-300">{d.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-xl font-semibold leading-tight sm:text-2xl">{d.name}</h3>
        <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="tnum text-3xl font-bold sm:text-4xl">{formatInr(price)}</span>
          <span className="tnum text-base text-white/60 line-through sm:text-lg">{formatInr(d.mrp)}</span>
          <span className="rounded-lg bg-bp-500/90 px-2 py-0.5 text-xs font-black">Save {formatInr(d.mrp - price)}</span>
        </div>
        <Countdown endsAt={d.deal.endsAt} size="sm" label="Deal ends in" dark className="mt-3" />
        <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-2.5">
          <AddToCartButton product={d} label="Grab this deal" variant="pink" size="md" />
          <Link
            href={`/products/${d.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Details <ChevronRight className="h-4 w-4" />
          </Link>
          {n > 1 && (
            <div className="ml-auto flex items-center gap-1.5" role="tablist" aria-label="Choose deal">
              {deals.map((p, idx) => (
                <button
                  key={p.sku}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  aria-label={`Deal ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={cn("h-2 rounded-full transition-all", idx === i ? "w-6 bg-white" : "w-2 bg-white/50")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
