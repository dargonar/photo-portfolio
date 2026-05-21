import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import CategoryClient from "./CategoryClient";

export const metadata: Metadata = {
  title: "Category — Pablo Tutino Photography",
};

export function generateStaticParams() {
  const slugs = new Set(siteConfig.series.map((s) => s.category_slug));
  return Array.from(slugs).map((slug) => ({ category: slug }));
}

export default function CategoryPage() {
  return <CategoryClient />;
}
