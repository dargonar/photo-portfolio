"use client";

import { siteConfig, allCategories } from "@/data/config";
import type { ImageData } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { useNerdMode } from "@/hooks/useNerdMode";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Lightbox } from "@/components/Lightbox";
import { NerdOverlay } from "@/components/NerdOverlay";

export default function SerieClient() {
  const params = useParams();
  const { t } = useI18n();
  const { nerdMode } = useNerdMode();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categorySlug = params.category as string;
  const serieSlug = params.serie as string;

  const serie = siteConfig.series.find((s) => s.serie_slug === serieSlug);
  if (!serie) return <div className="p-8 text-white/50">Serie not found</div>;

  const category = allCategories.find((c: { category_slug: string }) => c.category_slug === categorySlug);
  const catTitle = category
    ? category.title_es
      ? t(category.title, category.title_es)
      : category.title
    : categorySlug;

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Breadcrumb — data-mono style with chevron */}
      <div className="mb-12 flex items-center gap-2 font-pt-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
        <a
          href={`/${categorySlug}`}
          className="hover:text-white cursor-pointer transition-colors"
        >
          {catTitle}
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-white">
          {t(serie.serie_name, serie.serie_name_es)} — {serie.year}
        </span>
      </div>

      {/* Gallery — masonry preserving aspect ratios */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {serie.images.map((img: ImageData, idx: number) => (
          <div
            key={img.filename}
            className="relative break-inside-avoid group cursor-pointer overflow-hidden border border-transparent hover:border-outline-variant transition-all"
            onClick={() => setLightboxIndex(idx)}
          >
            <Image
              src={`/images/${serie.serie_slug}/${img.filename}`}
              alt={`${serie.serie_name} — ${img.filename}`}
              width={800}
              height={600}
              className="w-full h-auto"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            {nerdMode && <NerdOverlay image={img} />}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          serie={serie}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
