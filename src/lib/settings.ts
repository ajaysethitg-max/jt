import { normalizeImageUrl } from "./format";
import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Jeet Telecom",
  logoUrl: "",
  tagline: "Best Mobile. Best Price.",
  headline: "Dehradun's own one shop for mobile solution",
  announcements: [
    "Same Day Delivery in Dehradun — order before 6 PM",
    "0% Finance available — Bajaj Finserv · IDFC FIRST Bank · Home Credit",
    "Free gifts with every purchase — Trolley Bag · Noise Watch · boAt Headphones",
    "Best deal of the city, every single day",
  ],
  phone: "+91 98970 12345",
  whatsapp: "+919897012345",
  address: "Shop No. 12, Ground Floor, Rajpur Road, Dehradun, Uttarakhand 248001",
  hours: "Open all days · 10:00 AM – 9:00 PM",
  instagramUrl: "https://www.instagram.com/jeettelecomdehradun/",
  instagramHandle: "@jeettelecomdehradun",
  freeGifts: ["VIP Trolley Bag", "Noise Smartwatch", "boAt Headphones"],
  financePartners: ["Bajaj Finserv", "IDFC FIRST Bank", "Home Credit"],
  brands: ["Apple", "Samsung", "OPPO", "vivo", "Motorola", "realme", "Xiaomi", "OnePlus"],
  sameDayText: "Same Day Delivery in Dehradun",
  heroImage: "",
  storeImage: "",
  collectionImages: {},
  giftImages: [],
  financeLogos: [],
  brandLogos: [],
  mapUrl: "",
  deliveryAreas: ["Rajpur Road", "Ballupur", "Jakhan", "Sahastradhara", "GMS Road", "Clement Town", "Patel Nagar", "Subhash Nagar", "Dharampur", "Majra"],
  establishedYear: "2012",
};

export const SETTING_KEYS = [
  "site_name",
  "logo_url",
  "tagline",
  "headline",
  "announcement",
  "phone",
  "whatsapp",
  "address",
  "hours",
  "instagram_url",
  "instagram_handle",
  "free_gifts",
  "finance_partners",
  "brands",
  "same_day_text",
  "hero_image",
  "store_image",
  "collection_mobiles_image",
  "collection_audio_image",
  "collection_wearables_image",
  "collection_accessories_image",
  "gift_1_image",
  "gift_2_image",
  "gift_3_image",
  "delivery_areas",
  "finance_logos",
  "brand_logos",
  "map_url",
  "since_year",
] as const;

/** Like splitList but keeps blank slots, so logos line up with their names. */
function splitSlots(value: string | undefined): string[] {
  if (!value) return [];
  return value.split("|").map((s) => normalizeImageUrl(s.trim()));
}

function splitList(value: string | undefined): string[] | null {
  if (!value) return null;
  const items = value
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

/** Merges stored key/value settings over the defaults. */
export function resolveSettings(map: Record<string, string | undefined>): SiteSettings {
  const out: SiteSettings = { ...DEFAULT_SETTINGS, announcements: [...DEFAULT_SETTINGS.announcements], freeGifts: [...DEFAULT_SETTINGS.freeGifts], financePartners: [...DEFAULT_SETTINGS.financePartners], brands: [...DEFAULT_SETTINGS.brands], collectionImages: {}, giftImages: [], deliveryAreas: [...DEFAULT_SETTINGS.deliveryAreas], financeLogos: [], brandLogos: [] };
  const pick = (k: string) => (map[k] && map[k]!.trim() ? map[k]!.trim() : null);
  out.siteName = pick("site_name") ?? out.siteName;
  out.logoUrl = normalizeImageUrl(pick("logo_url"));
  out.tagline = pick("tagline") ?? out.tagline;
  out.headline = pick("headline") ?? out.headline;
  out.announcements = splitList(map.announcement) ?? out.announcements;
  out.phone = pick("phone") ?? out.phone;
  out.whatsapp = pick("whatsapp") ?? out.whatsapp;
  out.address = pick("address") ?? out.address;
  out.hours = pick("hours") ?? out.hours;
  out.instagramUrl = pick("instagram_url") ?? out.instagramUrl;
  out.instagramHandle = pick("instagram_handle") ?? out.instagramHandle;
  out.freeGifts = splitList(map.free_gifts) ?? out.freeGifts;
  out.financePartners = splitList(map.finance_partners) ?? out.financePartners;
  out.brands = splitList(map.brands) ?? out.brands;
  out.financeLogos = splitSlots(map.finance_logos);
  out.brandLogos = splitSlots(map.brand_logos);
  out.mapUrl = /^https?:\/\//i.test(pick("map_url") ?? "") ? pick("map_url")! : "";
  out.sameDayText = pick("same_day_text") ?? out.sameDayText;
  out.heroImage = normalizeImageUrl(map.hero_image);
  out.storeImage = normalizeImageUrl(map.store_image);
  out.collectionImages = {
    mobiles: normalizeImageUrl(map.collection_mobiles_image),
    audio: normalizeImageUrl(map.collection_audio_image),
    wearables: normalizeImageUrl(map.collection_wearables_image),
    accessories: normalizeImageUrl(map.collection_accessories_image),
  };
  out.deliveryAreas = splitList(map.delivery_areas) ?? out.deliveryAreas;
  out.establishedYear = pick("since_year") ?? out.establishedYear;
  out.giftImages = [1, 2, 3].map((n) => normalizeImageUrl(map[`gift_${n}_image`]));
  return out;
}
