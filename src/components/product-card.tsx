"use client";

import Link from "next/link";
import { ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn, discountPct, effectivePrice, formatInr } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { MiniCountdown } from "./countdown";
import { RatingStars } from "./rating-stars";
import { SmartImage } from "./smart-image";

export function ProductCard({
  product,
  priority,
  className,
}: {
  product: ProductSummary;
  priority?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const price = effectivePrice(product);
  const off = discountPct(product.mrp, price);
  const out = product.stock <= 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-tq-200 hover:shadow-lift",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-ink-50"
        aria-label={product.name}
      >
        <SmartImage
          src={product.images[0] ?? ""}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.deal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bp-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-pink">
              <Zap className="h-3 w-3" fill="currentColor" /> Deal
            </span>
          )}
          {product.badge && (
            <span className="rounded-full bg-tq-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}
          {off > 0 && !product.deal && (
            <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-bold text-white tnum">{off}% OFF</span>
          )}
        </div>
        {out && (
          <div className="absolute inset-0 grid place-items-center bg-white/75 text-xs font-bold uppercase tracking-[0.2em] text-ink-700">
            Out of stock
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={() =>
          add({
            sku: product.sku,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images[0] ?? "",
            price,
            mrp: product.mrp,
            maxQty: Math.max(1, Math.min(product.stock, 5)),
            dealEndsAt: product.deal?.endsAt ?? null,
          })
        }
        disabled={out}
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900 shadow-soft transition-all duration-200 hover:scale-105 hover:bg-tq-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        aria-label={`Add ${product.name} to cart`}
        title="Add to cart"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-tq-700">{product.brand}</span>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <RatingStars rating={product.rating} count={product.reviewCount} size={13} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2">
          <span className="tnum text-lg font-bold text-ink-900">{formatInr(price)}</span>
          {product.mrp > price && (
            <span className="tnum text-sm text-ink-400 line-through">{formatInr(product.mrp)}</span>
          )}
          {off > 0 && (
            <span className="rounded-md bg-bp-100 px-1.5 py-0.5 text-[11px] font-bold text-bp-700 tnum">{off}% off</span>
          )}
        </div>
        {product.deal ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-bp-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bp-500" />
            Ends in <MiniCountdown endsAt={product.deal.endsAt} />
          </div>
        ) : (
          product.stock > 0 && (
            <div className="mt-1 text-xs font-medium text-tq-700">In stock · Same day delivery in Dehradun</div>
          )
        )}
      </div>
    </div>
  );
}
