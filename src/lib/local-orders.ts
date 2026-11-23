import { formatInr } from "./format";
import type { CartItem, OrderRecord, Review } from "./types";

/**
 * Browser storage used on static hosting (GitHub Pages), where there is no
 * server to keep orders and reviews. Orders are handed to the shop on WhatsApp.
 */

const LAST_ORDER_KEY = "jeet-last-order";
const ORDERS_KEY = "jeet-orders";
const REVIEWS_KEY = "jeet-reviews";
export const ORDER_SENT_KEY = "jeet-order-sent";

export interface PlacedOrder {
  order: OrderRecord;
  /** local = created in the browser (static hosting) · server = stored in Postgres */
  channel: "local" | "server";
}

export function makeOrderNumber(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  return `JT-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage may be full — the order still proceeds
  }
}

export function saveOrder(placed: PlacedOrder): void {
  write(LAST_ORDER_KEY, placed);
  const list = read<PlacedOrder[]>(ORDERS_KEY) ?? [];
  write(ORDERS_KEY, [placed, ...list.filter((o) => o.order.orderNumber !== placed.order.orderNumber)].slice(0, 20));
}

export function getLastOrder(): PlacedOrder | null {
  const placed = read<PlacedOrder>(LAST_ORDER_KEY);
  return placed && placed.order && Array.isArray(placed.order.items) ? placed : null;
}

export function hasSentOrder(orderNumber: string): boolean {
  return read<string[]>(ORDER_SENT_KEY)?.includes(orderNumber) ?? false;
}

export function markOrderSent(orderNumber: string): void {
  const list = read<string[]>(ORDER_SENT_KEY) ?? [];
  write(ORDER_SENT_KEY, [orderNumber, ...list].slice(0, 20));
}

export function readLocalReviews(sku: string): Review[] {
  const all = read<Record<string, Review[]>>(REVIEWS_KEY) ?? {};
  return Array.isArray(all[sku]) ? all[sku] : [];
}

export function addLocalReview(sku: string, review: Review): Review[] {
  const all = read<Record<string, Review[]>>(REVIEWS_KEY) ?? {};
  const next = [review, ...(all[sku] ?? [])];
  write(REVIEWS_KEY, { ...all, [sku]: next });
  return next;
}

/** WhatsApp message that hands the order to the shop. */
export function orderWhatsAppMessage(order: OrderRecord): string {
  const a = order.address;
  const lines = [
    "🛒 *New order — Jeet Telecom*",
    `Order: *${order.orderNumber}*`,
    "------------------------------",
    ...order.items.map((item: CartItem, i: number) => `${i + 1}. ${item.name} × ${item.qty} — ${formatInr(item.price * item.qty)}`),
    "------------------------------",
    `Total: *${formatInr(order.total)}*${order.discount > 0 ? ` (customer saved ${formatInr(order.discount)})` : ""}`,
    `Delivery: ${order.deliveryOption === "same-day" ? "Same day delivery in Dehradun" : "Standard delivery (2–4 days)"}`,
    `Payment: ${order.paymentMethod}`,
    "------------------------------",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${a.line}${a.landmark ? `, ${a.landmark}` : ""}, ${a.city} — ${a.pincode}`,
  ];
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push("", "Reply to confirm. Thank you!");
  return lines.join("\n");
}

export function orderWhatsAppUrl(order: OrderRecord, whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(orderWhatsAppMessage(order))}`;
}
