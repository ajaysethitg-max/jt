import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { pageUrl } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: pageUrl("/") },
};

export default function HomePage() {
  return <HomeView />;
}
