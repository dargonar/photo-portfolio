import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import SerieClient from "./SerieClient";

export const metadata: Metadata = {
  title: "Serie — Pablo Tutino Photography",
};

export function generateStaticParams() {
  return siteConfig.series.map((s) => ({
    category: s.category_slug,
    serie: s.serie_slug,
  }));
}

export default function SeriePage() {
  return <SerieClient />;
}
