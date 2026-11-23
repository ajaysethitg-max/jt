"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn, effectivePrice } from "@/lib/format";
import type { Product, ProductSummary } from "@/lib/types";

type Variant = "primary" | "pink" | "outline" | "dark";

export function AddToCartButton({
  product,
  qty = 1,
  label = "Add to cart",
  buyNow = false,
  variant = "primary",
  size = "md",
  className,
}: {
  product: Product | ProductSummary;
  qty?: number;
  label?: string;
  buyNow?: boolean;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { add, notify } = useCart();
  const router = useRouter();
  const out = product.stock <= 0;
  const price = effectivePrice(product);

  const handle = () => {
    if (out) {
      notify("Sorry, this item is out of stock", "info");
      return;
    }
    add(
      {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.images[0] ?? "",
        price,
        mrp: product.mrp,
        maxQty: Math.max(1, Math.min(product.stock, 5)),
        dealEndsAt: product.deal?.endsAt ?? null,
      },
      qty,
    );
    if (buyNow) router.push("/checkout");
  };

  const sizes = size === "lg" ? "px-7 py-4 text-base" : size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm";
  const variants: Record<Variant, string> = {
    primary: "bg-tq-600 text-white shadow-tq hover:bg-tq-700",
    pink: "bg-bp-500 text-white shadow-pink hover:bg-bp-600",
    outline: "border border-ink-200 bg-white text-ink-800 hover:border-tq-400 hover:text-tq-700",
    dark: "bg-ink-900 text-white hover:bg-ink-800",
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={out}
      className={cn(
        "shine inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes,
        className,
      )}
    >
      {buyNow ? <ArrowRight className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {out ? "Out of stock" : label}
    </button>
  );
}
