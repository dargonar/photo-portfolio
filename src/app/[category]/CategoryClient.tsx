"use client";

import Image from "next/image";
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
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="border-b border-white/10 pb-4 mb-8">
        <h1 className="font-sans text-[0.7rem] md:text-sm uppercase tracking-widest">
          {catTitle}
        </h1>
      </div>

      <div className="space-y-2">
        {series.map((serie: Serie) => (
          <Link
            key={serie.serie_slug}
            href={`/${slug}/${serie.serie_slug}`}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 group"
          >
            {serie.images.slice(0, 4).map((img, i) => (
              <div
                key={img.filename}
                className="relative aspect-[4/3] overflow-hidden bg-white/5"
              >
                <Image
                  src={`/images/${serie.serie_slug}/${img.filename}`}
                  alt={`${serie.serie_name} — ${img.filename}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
                {i === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-end p-4">
                    <div>
                      <p className="font-pt-mono text-xl md:text-2xl">
                        {t(serie.serie_name, serie.serie_name_es)}
                      </p>
                      <p className="font-sans text-sm text-white/60">
                        {serie.year}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Link>
        ))}
      </div>

      {series.length === 0 && (
        <p className="text-white/40 font-sans text-center mt-20">
          No series in this category yet.
        </p>
      )}
    </div>
  );
}
