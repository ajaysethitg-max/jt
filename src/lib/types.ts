export type Category = "mobiles" | "audio" | "wearables" | "accessories";

export const CATEGORY_LABELS: Record<Category, string> = {
  mobiles: "Mobiles",
  audio: "Audio",
  wearables: "Wearables",
  accessories: "Accessories",
};

export const CATEGORY_LIST: Category[] = ["mobiles", "audio", "wearables", "accessories"];

export interface DealInfo {
  id: number;
  label: string | null;
  dealPrice: number;
  startsAt: string;
  endsAt: string;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  mrp: number;
  stock: number;
  badge: string | null;
  shortDescription: string;
  description: string;
  images: string[];
  colors: string[];
  storage: string | null;
  screen: string | null;
  battery: string | null;
  processor: string | null;
  warranty: string | null;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  deal: DealInfo | null;
}

export type ProductSummary = Omit<Product, "description">;

export interface Review {
  id: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
}

export interface Testimonial extends Review {
  productName: string;
  productSlug: string;
  productImage: string;
}

export interface CartItem {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
  maxQty: number;
  dealEndsAt: string | null;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  tagline: string;
  headline: string;
  announcements: string[];
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  instagramUrl: string;
  instagramHandle: string;
  freeGifts: string[];
  financePartners: string[];
  brands: string[];
  sameDayText: string;
  /** Optional image URLs from the Settings tab. Blank = bundled /images file. */
  heroImage: string;
  storeImage: string;
  collectionImages: Record<string, string>;
  giftImages: string[];
  deliveryAreas: string[];
  establishedYear: string;
}

/* ---------- Google Sheet row shapes (shared by demo seed + live sheet) ---------- */

export interface ProductRowInput {
  sku: string;
  slug?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  stock?: number;
  badge?: string | null;
  shortDescription?: string;
  description?: string;
  images: string[];
  colors?: string[];
  storage?: string | null;
  screen?: string | null;
  battery?: string | null;
  processor?: string | null;
  warranty?: string | null;
  tags?: string[];
  featured?: boolean;
}

export interface DealRowInput {
  sku: string;
  dealPrice: number;
  label?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
}

export interface ReviewRowInput {
  sku: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified?: boolean;
  date?: Date;
}

export type SettingsInput = Record<string, string>;

export interface CatalogBundle {
  products: ProductRowInput[];
  deals: DealRowInput[];
  reviews: ReviewRowInput[];
  settings: SettingsInput;
}

export type CatalogSource = "demo" | "sheet" | "import";

export type SheetName = "products" | "deals" | "reviews" | "settings";

export interface SyncCounts {
  products: number;
  deals: number;
  reviews: number;
  settings: number;
}

export interface SyncStateInfo {
  source: string;
  status: "idle" | "success" | "error";
  message: string;
  lastSyncAt: string | null;
  counts: SyncCounts | null;
  errors: string[];
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  customer: { name: string; phone: string; email: string };
  address: {
    line: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  deliveryOption: string;
  notes: string;
  status: string;
  createdAt: string;
}
