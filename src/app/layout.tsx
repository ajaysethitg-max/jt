import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { getAllProducts, getRecentReviews, getReviewsBySku, getSettingsSafe } from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: {
    default: "Jeet Telecom — Best Mobile, Best Price in Dehradun",
    template: "%s | Jeet Telecom",
  },
  description:
    "Dehradun's own one shop for mobile solution. Genuine mobiles and accessories from Apple, Samsung, OPPO, vivo, Motorola, realme, Xiaomi and OnePlus with same day delivery, 0% finance and free gifts.",
  keywords: ["Jeet Telecom", "mobile shop Dehradun", "same day delivery Dehradun", "0% finance mobile", "best mobile price Dehradun"],
  openGraph: {
    title: "Jeet Telecom — Best Mobile, Best Price in Dehradun",
    description: "Same day delivery in Dehradun, 0% finance on Bajaj, IDFC and Home Credit, free gifts with every purchase.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Rendered per request in server mode and once per page in a static build.
  const [products, settings, testimonials, reviewsBySku] = await Promise.all([
    getAllProducts(),
    getSettingsSafe(),
    getRecentReviews(6),
    getReviewsBySku(),
  ]);

  return (
    <html lang="en">
      <body className="min-h-screen">
        <CartProvider>
          <CatalogProvider initial={{ products, settings, testimonials, reviewsBySku }}>
            <Header />
            {children}
            <Footer />
            <CartDrawer />
          </CatalogProvider>
        </CartProvider>
      </body>
    </html>
  );
}
