import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/catalog";
import { pageUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getAllProducts();
  return [
    { url: pageUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: pageUrl("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => {
      const added = new Date(p.createdAt);
      return {
        url: pageUrl(`/products/${p.slug}`),
        lastModified: Number.isNaN(added.getTime()) ? now : added,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    }),
  ];
}
