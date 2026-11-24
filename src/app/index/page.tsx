"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { siteConfig } from "@/data/config";
import type { Serie, PhotoItem } from "@/types";
import { useI18n } from "@/hooks/useI18n";

// Index: todas las series y proyectos juntos — la diferencia se verá en credits/descripción.
export default function IndexPage() {
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mb-8">
        <h1 className="font-pt-mono text-[12px] tracking-[0.2em] NOTuppercase text-on-surface-variant">
          Index
        </h1>
        <div className="mt-2 h-[1px] w-full bg-outline-variant" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {all.map((serie) => {
          const file = thumbFile(serie);
          const isProject = serie.category_slug === "projects";
          const type = isProject ? t("Project", "Proyecto") : t("Series", "Serie");
          return (
            <Link
              key={serie.serie_slug}
              href={isProject ? `/projects/${serie.serie_slug}` : `/series/${serie.serie_slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                {file && (
                  <CldImage
                    src={`${serie.serie_slug}/${file.replace(/\.[^.]+$/, "")}`}
                    alt={`${t(serie.serie_name, serie.serie_name_es)} — ${file}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
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
        })}
      </div>

      {all.length === 0 && (
        <p className="text-on-surface-variant font-pt-mono text-center mt-20">
          Nothing here yet.
        </p>
      )}
    </div>
  );
}
