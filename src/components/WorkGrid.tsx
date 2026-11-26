"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { siteConfig } from "@/data/config";
import type { Serie, PhotoItem } from "@/types";
import { useI18n } from "@/hooks/useI18n";

// Grilla de todas las series + proyectos (usada en /work y debajo del carousel de home).
// Covers apaisadas: todas las celdas aspect 4/3.
// cols = columnas de las series en desktop (proyectos siempre 2 en desktop)
export default function WorkGrid({ cols = 4 }: { cols?: 2 | 4 }) {
  const { t } = useI18n();
  const all = siteConfig.series;

  const thumbFile = (serie: Serie): string | null => {
    const cover = serie.layout?.cover
      ? serie.images.find(
          (i): i is PhotoItem =>
            i.type === "photo" && i.data.filename === serie.layout!.cover
        )
      : undefined;
    const first = serie.images.find(
      (i): i is PhotoItem => i.type === "photo" && !i.data.not_visible_in_serie
    );
    const item = cover ?? first;
    return item ? item.data.filename : null;
  };

  const cell = (serie: Serie) => {
    const file = thumbFile(serie);
    const isProject = serie.category_slug === "projects";
    const type = isProject ? t("Project", "Proyecto") : t("Series", "Serie");
    return (
      <Link
        key={serie.serie_slug}
        href={isProject ? `/projects/${serie.serie_slug}` : `/series/${serie.serie_slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden bg-surface-container aspect-[4/3]">
          {file && (
            <CldImage
              src={`${serie.serie_slug}/${file.replace(/\.[^.]+$/, "")}`}
              alt={`${t(serie.serie_name, serie.serie_name_es)} — ${file}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            />
          )}
        </div>
        <div className="mt-3">
          <h2 className="font-pt-mono text-base text-primary leading-tight group-hover:text-secondary transition-colors">
            {t(serie.serie_name, serie.serie_name_es)}
          </h2>
          <p className="font-pt-mono text-[12px] text-on-surface-variant mt-1">
            {serie.year} — {type}
          </p>
        </div>
      </Link>
    );
  };

  const projects = all.filter((s) => s.category_slug === "projects");
  const series = all.filter((s) => s.category_slug !== "projects");

  return (
    <div className="space-y-10">
      {/* Proyectos: 2 columnas en desktop (celdas grandes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {projects.map(cell)}
      </div>
      {/* Series: 4 columnas en desktop (2 si cols=2) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
        {series.map(cell)}
      </div>
    </div>
  );
}
