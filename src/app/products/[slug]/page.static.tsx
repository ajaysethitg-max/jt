import { getAllProducts } from "@/lib/catalog";
import { ProductPage, generateProductMetadata } from "./product-view";

// Static build (page.static.tsx): one HTML file per product for GitHub Pages.
export const generateMetadata = generateProductMetadata;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export default ProductPage;
