import rawConfig from "./config.json";
import type { SiteConfig, Serie } from "@/types";

function castSerie(s: (typeof rawConfig.series)[number]): Serie {
  return {
    ...s,
    carousel_transition: s.carousel_transition as Serie["carousel_transition"],
    lightbox_mode: s.lightbox_mode as Serie["lightbox_mode"],
  };
}

export const siteConfig: SiteConfig = {
  ...rawConfig,
  series: rawConfig.series.map(castSerie),
} as SiteConfig;

export const allCategories: Array<{
  title: string;
  title_es?: string;
  category_slug: string;
}> = [
  ...siteConfig.categories.works.map((w) => ({ ...w })),
  {
    title: siteConfig.categories.projects.title,
    title_es: siteConfig.categories.projects.title_es,
    category_slug: siteConfig.categories.projects.category_slug,
  },
];
