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
import { Check, Info } from "lucide-react";
import type { CartItem } from "./types";

const STORAGE_KEY = "jeet-telecom-cart-v1";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "info";
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  mrpTotal: number;
  savings: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  notify: (message: string, tone?: Toast["tone"]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        Boolean(i) && typeof i.sku === "string" && typeof i.price === "number" && typeof i.qty === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    document.body.classList.toggle("locked", isOpen);
    return () => document.body.classList.remove("locked");
  }, [isOpen]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast({ id: Date.now(), message, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.sku === item.sku);
        if (existing) {
          return prev.map((i) =>
            i.sku === item.sku
              ? {
                  ...i,
                  qty: Math.min(item.maxQty, i.qty + qty),
                  price: item.price,
                  mrp: item.mrp,
                  dealEndsAt: item.dealEndsAt,
                  image: item.image,
                }
              : i,
          );
        }
        return [...prev, { ...item, qty: Math.min(item.maxQty, qty) }];
      });
      notify(`${item.name} added to your cart`);
    },
    [notify],
  );

  const remove = useCallback((sku: string) => setItems((prev) => prev.filter((i) => i.sku !== sku)), []);
  const setQty = useCallback(
    (sku: string, qty: number) =>
      setItems((prev) =>
        prev
          .map((i) => (i.sku === sku ? { ...i, qty: Math.min(i.maxQty, Math.max(0, qty)) } : i))
          .filter((i) => i.qty > 0),
      ),
    [],
  );
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const mrpTotal = items.reduce((sum, i) => sum + Math.max(i.mrp, i.price) * i.qty, 0);
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    return { subtotal, mrpTotal, savings: mrpTotal - subtotal, count };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      ...totals,
      isOpen,
      openCart,
      closeCart,
      add,
      remove,
      setQty,
      clear,
      notify,
    }),
    [items, hydrated, totals, isOpen, openCart, closeCart, add, remove, setQty, clear, notify],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div
            key={toast.id}
            role="status"
            className="flex animate-fade-up items-center gap-2.5 rounded-full bg-ink-900 py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-lift"
          >
            <span
              className={
                toast.tone === "success"
                  ? "grid h-6 w-6 place-items-center rounded-full bg-tq-500"
                  : "grid h-6 w-6 place-items-center rounded-full bg-bp-400"
              }
            >
              {toast.tone === "success" ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <Info className="h-3.5 w-3.5" strokeWidth={3} />
              )}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
