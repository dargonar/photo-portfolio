"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { useParams } from "next/navigation";
import { siteConfig, allCategories } from "@/data/config";
import type { Serie } from "@/types";
import { useI18n } from "@/hooks/useI18n";

export default function CategoryClient() {
  const params = useParams();
  const slug = params.category as string;
  const { t } = useI18n();

  const category = allCategories.find((c) => c.category_slug === slug);
  if (!category) return <div className="p-8 text-white/50">Category not found</div>;

  const series = siteConfig.series.filter((s) => s.category_slug === slug);

  const catTitle = category.title_es
    ? t(category.title, category.title_es)
    : category.title;

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Section Title — label style + separator line */}
      <div className="mb-8">
        <h1 className="font-pt-mono text-[12px] tracking-[0.2em] uppercase text-on-surface-variant">
          {catTitle}
        </h1>
        <div className="mt-2 h-[1px] w-full bg-outline-variant" />
      </div>

      {/* Series Feed — more spacing */}
      <div className="space-y-12">
        {series.map((serie: Serie) => (
          <Link
            key={serie.serie_slug}
            href={`/${slug}/${serie.serie_slug}`}
            className="grid grid-cols-2 md:grid-cols-4 gap-[1px] group"
          >
            {serie.images.slice(0, 4).map((img, i) => (
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

      {series.length === 0 && (
        <p className="text-white/40 font-pt-mono text-center mt-20">
          No series in this category yet.
        </p>
      )}
    </div>
  );
}
