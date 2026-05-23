"use client";

import { siteConfig, allCategories } from "@/data/config";
import type { SeriesItem, PhotoItem, TextItem, ImageData } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { useNerdMode } from "@/hooks/useNerdMode";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Lightbox } from "@/components/Lightbox";
import { NerdOverlay } from "@/components/NerdOverlay";

/* ── render a scatter-word canvas ── */
function ScatterCanvas({ item }: { item: TextItem }) {
  const { canvas, words } = item;
  const ratio = canvas ? canvas.width / canvas.height : 16 / 9;

  return (
    <div
      className="relative w-full bg-surface-container select-none"
      style={{ aspectRatio: ratio }}
    >
      {words?.map((w, i) => (
        <div
          key={i}
          className={`absolute whitespace-nowrap ${w.class ?? "word-body"}`}
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: `translate(-50%, -50%) rotate(${w.rotate ?? 0}deg)`,
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}

/* ── render a prose text block ── */
function ProseBlock({ item }: { item: TextItem }) {
  // Simple markdown-like parsing: **bold**, *italic*, > blockquote
  const html = (item.content_md ?? "")
    .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  return (
    <div
      className={`w-full py-12 px-4 flex items-center justify-center bg-surface-container ${
        item.class ?? ""
      }`}
      style={{ textAlign: item.align ?? "center" }}
    >
      <div
        className="text-slide-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function SerieClient() {
  const params = useParams();
  const { t } = useI18n();
  const { nerdMode } = useNerdMode();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categorySlug = params.category as string;
  const serieSlug = params.serie as string;

  const serie = siteConfig.series.find((s) => s.serie_slug === serieSlug);
  if (!serie) return <div className="p-8 text-white/50">Serie not found</div>;

  // Resolve items: if serie.items exists use it, else wrap images
  const items: SeriesItem[] = useMemo(
    () =>
      serie.items ??
      serie.images.map((img) => ({ type: "photo" as const, data: img })),
    [serie.items, serie.images]
  );

  const category = allCategories.find(
    (c: { category_slug: string }) => c.category_slug === categorySlug
  );
  const catTitle = category
    ? category.title_es
      ? t(category.title, category.title_es)
      : category.title
    : categorySlug;

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-12 flex items-center gap-2 font-pt-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
        <a
          href={`/${categorySlug}`}
          className="hover:text-white cursor-pointer transition-colors"
        >
          {catTitle}
        </a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-white">
          {t(serie.serie_name, serie.serie_name_es)} — {serie.year}
        </span>
      </div>

      {/* Gallery — masonry */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item: SeriesItem, idx: number) => {
          if (item.type === "photo") {
            const img = (item as PhotoItem).data;
            return (
              <div
                key={`photo-${img.filename}`}
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
            );
          }

          // Text item
          const textItem = item as TextItem;
          return (
            <div
              key={`text-${idx}`}
              className="break-inside-avoid cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              {textItem.layout === "scatter" ? (
                <ScatterCanvas item={textItem} />
              ) : (
                <ProseBlock item={textItem} />
              )}
            </div>
          );
        })}
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