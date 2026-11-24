import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { SerieView } from "@/components/SerieView";

export const metadata: Metadata = {
  title: "Project — Pablo Tutino Photography",
};

export function generateStaticParams() {
  return siteConfig.series
    .filter((s) => s.category_slug === "projects")
    .map((s) => ({ serie: s.serie_slug }));
}

export default function ProjectPage() {
  return <SerieView />;
}
