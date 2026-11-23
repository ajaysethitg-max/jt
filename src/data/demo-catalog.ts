import { endOfDayIst, startOfDayIst } from "@/lib/format";
import type { CatalogBundle, DealRowInput } from "@/lib/types";
import { DEMO_PRODUCTS } from "./demo-products";
import { DEMO_REVIEWS } from "./demo-reviews";

export function getDemoDeals(): DealRowInput[] {
  const startsAt = startOfDayIst();
  const endsAt = endOfDayIst();
  return [
    { sku: "IP15-PINK", dealPrice: 57999, label: "Deal of the Day", startsAt, endsAt },
    { sku: "S24FE", dealPrice: 49999, label: "Deal of the Day", startsAt, endsAt },
    { sku: "BUDSFE", dealPrice: 8499, label: "Flash Deal", startsAt, endsAt },
    { sku: "CFPRO4", dealPrice: 2299, label: "Flash Deal", startsAt, endsAt },
    { sku: "ANKER20", dealPrice: 899, label: "Flash Deal", startsAt, endsAt },
    { sku: "RK255", dealPrice: 999, label: "Flash Deal", startsAt, endsAt },
  ];
}

export function getDemoSettings(): Record<string, string> {
  return {
    site_name: "Jeet Telecom",
    logo_url: "",
    tagline: "Best Mobile. Best Price.",
    headline: "Dehradun's own one shop for mobile solution",
    announcement:
      "Same Day Delivery in Dehradun — order before 6 PM | 0% Finance available — Bajaj Finserv · IDFC FIRST Bank · Home Credit | Free gifts with every purchase — Trolley Bag · Noise Watch · boAt Headphones | Best deal of the city, every single day",
    phone: "+91 98970 12345",
    whatsapp: "+919897012345",
    address: "Shop No. 12, Ground Floor, Rajpur Road, Dehradun, Uttarakhand 248001",
    hours: "Open all days · 10:00 AM – 9:00 PM",
    instagramUrl: "https://www.instagram.com/jeettelecomdehradun/",
    instagram_handle: "@jeettelecomdehradun",
    free_gifts: "VIP Trolley Bag | Noise Smartwatch | boAt Headphones",
    finance_partners: "Bajaj Finserv | IDFC FIRST Bank | Home Credit",
    brands: "Apple | Samsung | OPPO | vivo | Motorola | realme | Xiaomi | OnePlus",
    same_day_text: "Same Day Delivery in Dehradun",
  };
}

export function getDemoBundle(): CatalogBundle {
  return {
    products: DEMO_PRODUCTS,
    deals: getDemoDeals(),
    reviews: DEMO_REVIEWS.map((r) => ({ ...r, date: r.date ?? new Date() })),
    settings: getDemoSettings(),
  };
}
