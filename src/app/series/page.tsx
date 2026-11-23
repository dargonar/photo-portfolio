"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { siteConfig } from "@/data/config";
import type { Serie, PhotoItem } from "@/types";
import { useI18n } from "@/hooks/useI18n";

const workSeries = siteConfig.series.filter(
  (s) => s.category_slug !== "projects"
);

export default function SeriesPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Section Title — label style + separator line */}
      <div className="mb-8">
        <h1 className="font-pt-mono text-[12px] tracking-[0.2em] NOTuppercase text-on-surface-variant">
          Series
        </h1>
        <div className="mt-2 h-[1px] w-full bg-outline-variant" />
      </div>

      {/* Series Feed — mobile: 1 large photo per serie */}
      <div className="space-y-8 md:hidden">
        {workSeries.map((serie: Serie) => {
          const cover = serie.images.find(
            (item): item is PhotoItem =>
              item.type === "photo" && !item.data.not_visible_in_serie
          );
          if (!cover) return null;
          return (
            <Link
              key={serie.serie_slug}
              href={`/series/${serie.serie_slug}`}
              className="relative block aspect-[4/3] overflow-hidden bg-surface-container group"
            >
              <CldImage
                src={`${serie.serie_slug}/${cover.data.filename.replace(/\.[^.]+$/, "")}`}
                alt={`${serie.serie_name} — ${cover.data.filename}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-pt-mono text-xl text-white leading-tight">
                  {t(serie.serie_name, serie.serie_name_es)}
                </h2>
                <p className="font-pt-mono text-[12px] text-white/80 mt-1">
                  {serie.year}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Series Feed — desktop: 4-thumb grid */}
      <div className="space-y-12 hidden md:block">
        {workSeries.map((serie: Serie) => (
          <Link
            key={serie.serie_slug}
            href={`/series/${serie.serie_slug}`}
            className="grid grid-cols-4 gap-[1px] group"
          >
            {serie.images
                          .filter((item): item is PhotoItem => item.type === "photo" && !item.data.not_visible_in_serie)
                          .slice(0, 4)
                          .map((img, i) => (
                          <div
                            key={img.data.filename}
                            className="relative aspect-[4/3] overflow-hidden bg-surface-container"
                          >
                            <CldImage
                              src={`${serie.serie_slug}/${img.data.filename.replace(/\\.[^.]+$/, "")}`}
                              alt={`${serie.serie_name} — ${img.data.filename}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
                {i === 0 && (
                  <div className="absolute inset-0 bg-black/30 p-4 flex flex-col justify-start">
                    <h2 className="font-pt-mono text-xl md:text-2xl text-white leading-tight">
                      {t(serie.serie_name, serie.serie_name_es)}
                    </h2>
                    <p className="font-pt-mono text-[12px] text-on-surface-variant mt-1">
                      {serie.year}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </Link>
        ))}
      </div>

      {workSeries.length === 0 && (
        <p className="text-on-surface-variant font-pt-mono text-center mt-20">
          No series yet.
        </p>
      )}
    </div>
  );
}