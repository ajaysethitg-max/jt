import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductBrowser, ProductBrowserFallback } from "@/components/product-browser";
import { absUrl, pageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "All products — mobiles, audio, wearables & accessories",
  description: "Browse genuine mobiles and accessories at Jeet Telecom Dehradun with filters by brand, category and price.",
  alternates: { canonical: pageUrl("/products") },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: pageUrl("/products"),
    title: "All products — mobiles, audio, wearables & accessories",
    description: "Browse genuine mobiles and accessories at Jeet Telecom Dehradun with filters by brand, category and price.",
    images: [absUrl("/images/hero.jpg")],
  },
};

export default function ProductsPage() {
  // Filters live in the URL, so the grid reads them on the client. The
  // Suspense boundary lets this page be prerendered for GitHub Pages.
  return (
    <Suspense fallback={<ProductBrowserFallback />}>
      <ProductBrowser />
    </Suspense>
  );
}
