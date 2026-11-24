import type { Metadata, Viewport } from "next";
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
import { JsonLd } from "@/components/json-ld";
import { inlineTagline } from "@/lib/format";
import { SITE_URL, absUrl, clip, pageUrl } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#12736a",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsSafe();
  const title = `${s.siteName} — ${inlineTagline(s.tagline)} in Dehradun`;
  const description = clip(
    `${s.headline}. Genuine ${s.brands.slice(0, 4).join(", ")} phones & accessories — 0% finance, free gifts, ${s.sameDayText}.`,
  );
  const image = absUrl(s.heroImage || "/images/hero.jpg");
  return {
    metadataBase: new URL(`${SITE_URL}/`),
    title: { default: title, template: `%s | ${s.siteName}` },
    description,
    applicationName: s.siteName,
    keywords: [s.siteName, "mobile shop Dehradun", "same day delivery Dehradun", "0% finance mobile", "best mobile price Dehradun", "buy mobile online Dehradun"],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
    openGraph: {
      type: "website",
      siteName: s.siteName,
      locale: "en_IN",
      url: pageUrl("/"),
      title,
      description,
      images: [{ url: image, alt: `${s.siteName} — ${inlineTagline(s.tagline)}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Rendered per request in server mode and once per page in a static build.
  const [products, settings, testimonials, reviewsBySku] = await Promise.all([
    getAllProducts(),
    getSettingsSafe(),
    getRecentReviews(6),
    getReviewsBySku(),
  ]);

  return (
    <html lang="en-IN">
      <body className="min-h-screen">
        <JsonLd
          graph={[
            {
              "@type": "MobilePhoneStore",
              "@id": `${SITE_URL}/#store`,
              name: settings.siteName,
              url: pageUrl("/"),
              description: settings.headline,
              image: absUrl(settings.heroImage || "/images/hero.jpg"),
              ...(settings.logoUrl ? { logo: absUrl(settings.logoUrl) } : {}),
              ...(settings.mapUrl ? { hasMap: settings.mapUrl } : {}),
              telephone: settings.phone,
              priceRange: "₹₹",
              foundingDate: settings.establishedYear,
              currenciesAccepted: "INR",
              paymentAccepted: "Cash, UPI, Credit Card, Debit Card, EMI",
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.address,
                addressLocality: "Dehradun",
                addressRegion: "Uttarakhand",
                addressCountry: "IN",
              },
              areaServed: settings.deliveryAreas.map((name) => ({ "@type": "Place", name })),
              ...(settings.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}),
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: pageUrl("/"),
              name: settings.siteName,
              inLanguage: "en-IN",
              publisher: { "@id": `${SITE_URL}/#store` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${pageUrl("/products")}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
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
