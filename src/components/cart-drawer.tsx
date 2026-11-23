"use client";

import Link from "next/link";
import { ArrowRight, Gift, Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useCatalog } from "@/lib/catalog-context";
import { cn, formatInr } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { SmartImage } from "./smart-image";

export function CartDrawer() {
  const { settings } = useCatalog();
  const { items, isOpen, closeCart, setQty, remove, subtotal, savings, count, hydrated } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]" onClick={closeCart} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-lift transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">Your cart</h2>
            <p className="mt-0.5 text-xs font-semibold text-ink-500">
              {hydrated ? `${count} ${count === 1 ? "item" : "items"} · Free gifts included` : "Loading…"}
            </p>
          </div>
          <button type="button" onClick={closeCart} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink-50" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </header>

        {!hydrated ? (
          <div className="flex-1 space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-tq-100 to-bp-100">
              <Gift className="h-10 w-10 text-bp-500" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink-900">Your cart is empty</h3>
            <p className="max-w-xs text-sm text-ink-500">
              Add a phone or accessory and a free gift is automatically reserved for you at the counter.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="shine mt-2 inline-flex items-center gap-2 rounded-full bg-tq-600 px-6 py-3 text-sm font-bold text-white hover:bg-tq-700"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.sku} className="flex gap-3 py-4">
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                    <SmartImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 hover:text-tq-700">
                        {item.name}
                      </Link>
                      <button type="button" onClick={() => remove(item.sku)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-bp-50 hover:text-bp-600" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-ink-400">{item.brand}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-ink-200">
                        <button type="button" onClick={() => setQty(item.sku, item.qty - 1)} className="grid h-8 w-8 place-items-center text-ink-600 hover:text-tq-700" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="tnum w-6 text-center text-sm font-bold text-ink-900">{item.qty}</span>
                        <button type="button" onClick={() => setQty(item.sku, item.qty + 1)} disabled={item.qty >= item.maxQty} className="grid h-8 w-8 place-items-center text-ink-600 hover:text-tq-700 disabled:opacity-30" aria-label="Increase quantity">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-sm font-bold text-ink-900">{formatInr(item.price * item.qty)}</p>
                        {item.mrp > item.price && <p className="tnum text-xs text-ink-400 line-through">{formatInr(item.mrp * item.qty)}</p>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-100 bg-ink-50 px-5 py-4">
              <div className="flex items-center gap-2 rounded-xl bg-bp-50 px-3 py-2.5 text-xs font-semibold text-bp-700">
                <Gift className="h-4 w-4 shrink-0" /> Free gift reserved: {settings.freeGifts[0] ?? "Surprise gift"}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-tq-700">
                <Truck className="h-4 w-4" /> {settings.sameDayText} · Free delivery
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-500">
                  <span>MRP total</span>
                  <span className="tnum line-through">{formatInr(subtotal + savings)}</span>
                </div>
                <div className="flex justify-between font-semibold text-bp-600">
                  <span>You save</span>
                  <span className="tnum">− {formatInr(savings)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink-900">
                  <span>Subtotal</span>
                  <span className="tnum">{formatInr(subtotal)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="shine mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-tq-700"
              >
                Checkout securely <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={closeCart} className="mt-2 w-full py-2 text-xs font-bold uppercase tracking-wider text-ink-500 hover:text-tq-700">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
