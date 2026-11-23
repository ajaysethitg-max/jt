import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { deals, orders, products } from "@/db/schema";
import { round2 } from "./format";
import type { CartItem, OrderRecord } from "./types";

export interface OrderInput {
  customer: { name: string; phone: string; email: string };
  address: { line: string; landmark: string; city: string; state: string; pincode: string };
  items: { sku: string; qty: number }[];
  deliveryOption: string;
  paymentMethod: string;
  notes: string;
}

type OrderRow = typeof orders.$inferSelect;

export function toOrderRecord(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customer: row.customer,
    address: row.address,
    items: row.items,
    subtotal: row.subtotal,
    discount: row.discount,
    delivery: row.delivery,
    total: row.total,
    paymentMethod: row.paymentMethod,
    deliveryOption: row.deliveryOption,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Re-prices the cart server-side against current catalog and live deals. */
export async function priceCart(items: { sku: string; qty: number }[]): Promise<{ items: CartItem[]; subtotal: number; discount: number; total: number }> {
  const skus = [...new Set(items.map((i) => i.sku))];
  if (!skus.length) throw new Error("Your cart is empty");
  const rows = await db.select().from(products).where(and(inArray(products.sku, skus), eq(products.isActive, true)));
  const now = new Date();
  const dealRows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.active, true), inArray(deals.productSku, skus), lte(deals.startsAt, now), gte(deals.endsAt, now)));
  const dealMap = new Map<string, number>();
  for (const d of dealRows) dealMap.set(d.productSku, Math.min(dealMap.get(d.productSku) ?? Number.POSITIVE_INFINITY, d.dealPrice));

  const out: CartItem[] = [];
  let subtotal = 0;
  let mrpTotal = 0;
  for (const it of items) {
    const p = rows.find((r) => r.sku === it.sku);
    if (!p || p.stock <= 0) continue;
    const qty = Math.max(1, Math.min(5, Math.round(it.qty || 1)));
    const price = dealMap.get(p.sku) ?? p.price;
    out.push({ sku: p.sku, slug: p.slug, name: p.name, brand: p.brand, image: p.images[0] ?? "", price, mrp: p.mrp, qty, maxQty: Math.min(p.stock, 5), dealEndsAt: null });
    subtotal += price * qty;
    mrpTotal += Math.max(p.mrp, price) * qty;
  }
  if (!out.length) throw new Error("None of the items in your cart are available");
  return { items: out, subtotal: round2(subtotal), discount: round2(mrpTotal - subtotal), total: round2(subtotal) };
}

export function makeOrderNumber(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JT-${stamp}-${rand}`;
}

export async function createOrder(input: OrderInput): Promise<OrderRecord> {
  const priced = await priceCart(input.items);
  const orderNumber = makeOrderNumber();
  const row = await db
    .insert(orders)
    .values({
      orderNumber,
      customer: input.customer,
      address: input.address,
      items: priced.items,
      subtotal: priced.subtotal,
      discount: priced.discount,
      delivery: 0,
      total: priced.total,
      paymentMethod: input.paymentMethod,
      deliveryOption: input.deliveryOption,
      notes: input.notes,
      status: "confirmed",
    })
    .returning();
  return toOrderRecord(row[0]);
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderRecord | null> {
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return rows[0] ? toOrderRecord(rows[0]) : null;
}
