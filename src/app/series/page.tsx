"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { siteConfig } from "@/data/config";
import type { Serie } from "@/types";
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

      {/* Series Feed */}
      <div className="space-y-12">
        {workSeries.map((serie: Serie) => (
          <Link
            key={serie.serie_slug}
            href={`/${serie.category_slug}/${serie.serie_slug}`}
            className="grid grid-cols-2 md:grid-cols-4 gap-[1px] group"
          >
            {serie.images.filter(img => !img.not_visible_in_serie).slice(0, 4).map((img, i) => (
              <div
                key={img.filename}
                className="relative aspect-[4/3] overflow-hidden bg-surface-container"
              >
                <CldImage
                  src={`${serie.serie_slug}/${img.filename.replace(/\.[^.]+$/, "")}`}
                  alt={`${serie.serie_name} — ${img.filename}`}
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
        <p className="text-white/40 font-pt-mono text-center mt-20">
          No series yet.
        </p>
      )}
    </div>
  );
}