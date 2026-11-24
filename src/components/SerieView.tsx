"use client";

import { siteConfig, allCategories } from "@/data/config";
import type { SeriesItem, PhotoItem, TextItem } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { useNerdMode } from "@/hooks/useNerdMode";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Lightbox } from "@/components/Lightbox";
import { EditorialLayout } from "@/components/EditorialLayout";
import { EditorialLightbox } from "@/components/EditorialLightbox";
import { NerdOverlay } from "@/components/NerdOverlay";
import { ScatterWordsLayer } from "@/components/ScatterWordsLayer";
import { mdToHtml } from "@/lib/mdToHtml";

/* ── render a scatter-word canvas ── */
function ScatterCanvas({ item }: { item: TextItem }) {
  const { canvas, words } = item;
  const ratio = canvas ? canvas.width / canvas.height : 16 / 9;

  return (
    <div
      className="relative w-full bg-surface-container select-none overflow-hidden"
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
  const html = mdToHtml(item.content_md ?? "");

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

export function SerieView() {
  const params = useParams();
  const { t } = useI18n();
  const { nerdMode } = useNerdMode();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openFn, setOpenFn] = useState<string | null>(null);

  const serieSlug = params.serie as string;

  const serie = siteConfig.series.find((s) => s.serie_slug === serieSlug);
  if (!serie) return <div className="p-8 text-on-surface-variant">Serie not found</div>;

  // Filter out items marked as not visible in serie (but keep them for lightbox)
    const items: SeriesItem[] = useMemo(
      () =>
        serie.images.filter((item) =>
          item.type !== "photo" || !(item as PhotoItem).data.not_visible_in_serie
        ),
      [serie.images]
    );

  const isProject = serie.category_slug === siteConfig.categories.projects.category_slug;
  const backHref = isProject ? "/projects" : "/series";
  const backLabel = isProject
    ? (() => {
        const category = allCategories.find(
          (c: { category_slug: string }) => c.category_slug === serie.category_slug
        );
        return category
          ? category.title_es
            ? t(category.title, category.title_es)
            : category.title
          : "Projects";
      })()
    : t("Series", "Series");

  // Nuevo layout editorial (opt-in via serie.layout) — sin breadcrumb en el hero
  if (serie.layout) {
    const photoFns = serie.images
      .filter((i) => i.type === "photo")
      .map((i) => (i as PhotoItem).data.filename);
    return (
      <div className="min-h-screen">
        <EditorialLayout serie={serie} onOpen={setOpenFn} />
        {openFn !== null && (
          <EditorialLightbox
            serie={serie}
            filenames={photoFns}
            initialFilename={openFn}
            onClose={() => setOpenFn(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-12 flex items-center gap-2 font-pt-mono text-[17px] pt-[10px]  uppercase tracking-[0.1em] text-on-surface-variant">
        <a
          href={backHref}
          className="hover:text-primary cursor-pointer transition-colors"
        >
          {backLabel}
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
        <span className="text-primary">
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
                {/* raw Cloudinary URL: q_auto,f_auto + c_limit,w_800 (next-cloudinary t_-prefixed arrays fail) */}
                <img
                  src={`https://res.cloudinary.com/dhr3jdnve/image/upload/q_auto,f_auto/c_limit,w_800/${serie.serie_slug}/${img.filename.replace(/\.[^.]+$/, "")}`}
                  alt={`${serie.serie_name} — ${img.filename}`}
                  loading="lazy"
                  className="w-full h-auto"
                />
                {item.words && <ScatterWordsLayer words={item.words} />}
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
