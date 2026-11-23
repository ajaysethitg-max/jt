import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { CartItem } from "@/lib/types";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    sku: text("sku").notNull().unique(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull().default("accessories"),
    price: numeric("price", { precision: 12, scale: 2, mode: "number" }).notNull(),
    mrp: numeric("mrp", { precision: 12, scale: 2, mode: "number" }).notNull(),
    stock: integer("stock").notNull().default(0),
    badge: text("badge"),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    images: jsonb("images").$type<string[]>().notNull(),
    colors: jsonb("colors").$type<string[]>().notNull(),
    storage: text("storage"),
    screen: text("screen"),
    battery: text("battery"),
    processor: text("processor"),
    warranty: text("warranty"),
    tags: jsonb("tags").$type<string[]>().notNull(),
    featured: boolean("featured").notNull().default(false),
    rating: numeric("rating", { precision: 3, scale: 2, mode: "number" }).notNull(),
    reviewCount: integer("review_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_brand_idx").on(t.brand),
  ],
);

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  productSku: text("product_sku")
    .notNull()
    .references(() => products.sku, { onDelete: "cascade" }),
  label: text("label"),
  dealPrice: numeric("deal_price", { precision: 12, scale: 2, mode: "number" }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  active: boolean("active").notNull().default(true),
  source: text("source").notNull().default("sheet"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  verified: boolean("verified").notNull().default(true),
  source: text("source").notNull().default("store"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customer: jsonb("customer")
    .$type<{ name: string; phone: string; email: string }>()
    .notNull(),
  address: jsonb("address")
    .$type<{
      line: string;
      landmark: string;
      city: string;
      state: string;
      pincode: string;
    }>()
    .notNull(),
  items: jsonb("items").$type<CartItem[]>().notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2, mode: "number" }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  delivery: numeric("delivery", { precision: 12, scale: 2, mode: "number" }).notNull(),
  total: numeric("total", { precision: 12, scale: 2, mode: "number" }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  deliveryOption: text("delivery_option").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const syncState = pgTable("sync_state", {
  id: integer("id").primaryKey(),
  source: text("source").notNull().default("demo"),
  status: text("status").notNull().default("idle"),
  message: text("message").notNull().default(""),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  counts: jsonb("counts").$type<{
    products: number;
    deals: number;
    reviews: number;
    settings: number;
  }>(),
  errors: jsonb("errors").$type<string[]>().notNull(),
});
