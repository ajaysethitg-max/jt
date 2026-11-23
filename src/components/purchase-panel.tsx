"use client";

import { useState, type FormEvent } from "react";
import { Gift, Minus, Percent, Plus, ShieldCheck, Truck, Zap } from "lucide-react";
import { cn, discountPct, effectivePrice, formatInr } from "@/lib/format";
import { CATEGORY_LABELS, type Product, type SiteSettings } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { useCatalog } from "@/lib/catalog-context";
import { Countdown } from "./countdown";
import { RatingStars } from "./rating-stars";

export function PurchasePanel({ product }: { product: Product }) {
  const { settings } = useCatalog();
  const price = effectivePrice(product);
  const off = discountPct(product.mrp, price);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [tenure, setTenure] = useState(6);
  const [pin, setPin] = useState("");
  const [checked, setChecked] = useState(false);

  const dehradun = /^24[89]\d{3}$/.test(pin);
  const out = product.stock <= 0;
  const low = !out && product.stock <= 5;
  const maxQty = Math.max(1, Math.min(product.stock, 5));

  const checkPin = (e: FormEvent) => {
    e.preventDefault();
    setChecked(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-tq-700">
          {product.brand} · {CATEGORY_LABELS[product.category]}
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <RatingStars rating={product.rating} count={product.reviewCount} showValue />
          <a href="#reviews" className="text-sm font-semibold text-tq-700 underline-offset-4 hover:underline">
            Read {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
          </a>
        </div>
      </div>

      <div className="rounded-2xl bg-ink-50 p-5">
        {product.deal ? (
          <>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-bp-700">
              <Zap className="h-3.5 w-3.5" fill="currentColor" /> {product.deal.label ?? "Deal of the day"} — price cut for a limited time
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="tnum text-4xl font-bold text-ink-900">{formatInr(price)}</span>
              <span className="tnum text-xl text-ink-400 line-through">{formatInr(product.mrp)}</span>
              <span className="tnum rounded-lg bg-bp-500 px-2 py-1 text-xs font-black text-white">{off}% off</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-bp-700">You save {formatInr(product.mrp - price)}</p>
            <Countdown className="mt-5" endsAt={product.deal.endsAt} label="Deal ends in" />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="tnum text-4xl font-bold text-ink-900">{formatInr(price)}</span>
              {product.mrp > price && (
                <>
                  <span className="tnum text-xl text-ink-400 line-through">{formatInr(product.mrp)}</span>
                  <span className="tnum rounded-lg bg-bp-500 px-2 py-1 text-xs font-black text-white">{off}% off</span>
                </>
              )}
            </div>
            {product.mrp > price && <p className="mt-1 text-sm font-semibold text-bp-700">You save {formatInr(product.mrp - price)} on MRP</p>}
          </>
        )}
        <p className="mt-3 text-xs text-ink-500">Inclusive of all taxes · GST bill · {out ? "Currently out of stock" : `In stock (${product.stock} available)`}</p>
      </div>

      <div className="rounded-2xl border border-ink-100 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <Percent className="h-4 w-4 text-tq-600" /> 0% EMI available
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[3, 6, 9, 12].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTenure(n)}
              className={cn(
                "rounded-xl border px-1 py-2 text-xs font-bold transition",
                tenure === n ? "border-tq-500 bg-tq-50 text-tq-800" : "border-ink-200 text-ink-600 hover:border-tq-300",
              )}
              aria-pressed={tenure === n}
            >
              {n} months
              <span className="tnum mt-0.5 block">{formatInr(Math.round(price / n))}/mo</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          No cost EMI with {settings.financePartners.join(", ")}. Bring your PAN and Aadhaar — approved at the counter.
        </p>
      </div>

      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-bold text-ink-900">
            Colour — <span className="font-semibold text-ink-500">{color}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                  color === c ? "border-tq-500 bg-tq-50 text-tq-800" : "border-ink-200 text-ink-600 hover:border-tq-300",
                )}
                aria-pressed={color === c}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {product.storage && (
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-ink-900">Storage</span>
          <span className="rounded-full bg-ink-50 px-3 py-1 font-semibold text-ink-700 ring-1 ring-ink-200">{product.storage}</span>
        </div>
      )}

      <div>
        <p className="text-sm font-bold text-ink-900">Check delivery at your pincode</p>
        <form onSubmit={checkPin} className="mt-2 flex gap-2">
          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setChecked(false);
            }}
            inputMode="numeric"
            placeholder="e.g. 248001"
            className="w-36 rounded-full border border-ink-200 px-4 py-2 text-sm outline-none focus:border-tq-500"
            aria-label="Delivery pincode"
          />
          <button type="submit" className="rounded-full bg-ink-900 px-5 py-2 text-sm font-bold text-white hover:bg-tq-700">
            Check
          </button>
        </form>
        {checked && pin.length === 6 && (
          <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-bold", dehradun ? "text-bp-700" : "text-ink-600")}>
            <Truck className="h-4 w-4" />
            {dehradun ? `${settings.sameDayText} — order before 6 PM` : "Free delivery in 2–4 days"}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center rounded-full border border-ink-200 bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-10 place-items-center text-ink-600 hover:text-tq-700" aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="tnum w-8 text-center text-base font-bold text-ink-900">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="grid h-12 w-10 place-items-center text-ink-600 hover:text-tq-700 disabled:opacity-30" aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <AddToCartButton product={product} qty={qty} size="lg" className="flex-1" />
        <AddToCartButton product={product} qty={qty} buyNow label="Buy now" variant="dark" size="lg" className="flex-1" />
      </div>
      {low && <p className="text-sm font-bold text-bp-700">Only {product.stock} left in stock — hurry before the deal timer ends.</p>}

      <ul className="grid gap-2.5 rounded-2xl bg-tq-50 p-4 text-sm font-semibold text-ink-700 sm:grid-cols-2">
        <li className="flex gap-2">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-bp-500" /> Free gift: {settings.freeGifts.join(" / ")}
        </li>
        <li className="flex gap-2">
          <Percent className="mt-0.5 h-4 w-4 shrink-0 text-tq-600" /> 0% finance — {settings.financePartners.join(", ")}
        </li>
        <li className="flex gap-2">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-tq-600" /> {settings.sameDayText}
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-tq-600" /> {product.warranty ?? "Brand warranty"}
        </li>
      </ul>
    </div>
  );
}
