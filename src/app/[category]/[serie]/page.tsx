import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { SerieView } from "@/components/SerieView";

export const metadata: Metadata = {
  title: "Serie — Pablo Tutino Photography",
};

// Solo projects mantienen la categoría en la URL (/projects/adhd).
// Las demas series viven en /series/:serie (ver redirects en netlify.toml).
export function generateStaticParams() {
  return siteConfig.series
    .filter((s) => s.category_slug === "projects")
    .map((s) => ({
      category: s.category_slug,
      serie: s.serie_slug,
    }));
}

export default function SeriePage() {
  return <SerieView />;
}
