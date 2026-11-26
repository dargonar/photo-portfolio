"use client";

import { Fragment } from "react";
import { siteConfig } from "@/data/config";
import type { Serie, PhotoItem, LayoutCell, LayoutRow, TextSlot } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { mdToHtml } from "@/lib/mdToHtml";

const CDN = "https://res.cloudinary.com/dhr3jdnve/image/upload";

function cdnUrl(serieSlug: string, filename: string, width: number) {
  // f_webp en vez de f_auto: f_auto puede servir AVIF y romper decoders sin soporte
  return `${CDN}/q_auto,f_webp/c_limit,w_${width}/${serieSlug}/${filename.replace(/\.[^.]+$/, "")}`;
}

/* ── text slots ── */
function TextSlotView({ slot }: { slot: TextSlot }) {
  const { t } = useI18n();
  if (slot.layout === "credits") {
    return (
      <div className={`w-full ${slot.class ?? ""}`}>
        {slot.title && (
          <h3 className="font-pt-mono text-[11px] uppercase tracking-[0.15em] text-on-surface-variant mb-6">
            {t(slot.title ?? "", slot.title_es ?? "")}
          </h3>
        )}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 font-pt-mono text-sm">
          {slot.items.map((it, i) => (
            <div key={i} className="contents">
              <dt className="text-on-surface-variant">{it.role}</dt>
              <dd className="text-primary">{it.name}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  // prose
  return (
    <div className={`w-full ${slot.class ?? ""}`}>
      {slot.title && (
        <h3 className="text-2xl md:text-3xl font-light text-primary mb-6">
          {t(slot.title ?? "", slot.title_es ?? "")}
        </h3>
      )}
      <div
        className="text-slide-prose"
        style={{ textAlign: slot.align ?? "left" }}
        dangerouslySetInnerHTML={{ __html: mdToHtml(t(slot.content_md ?? "", slot.content_md_es ?? "")) }}
      />
    </div>
  );
}

/* ── one slot cell ── */
const alignClass = { top: "items-start", center: "items-center", bottom: "items-end" } as const;

function Cell({
  serie,
  cell,
  width,
  fit,
  onOpen,
}: {
  serie: Serie;
  cell: LayoutCell;
  width: number;
  fit?: boolean;
  onOpen: (filename: string) => void;
}) {
  if (cell.text) {
    const slot = serie.layout?.text_slots?.[cell.text];
    if (!slot) return null;
    return <TextSlotView slot={slot} />;
  }
  const item = serie.images.find(
    (i) => i.type === "photo" && (i as PhotoItem).data.filename === cell.photo
  ) as PhotoItem | undefined;
  if (!item) return null;
  const img = item.data;
  return (
    <div
      className={`relative flex min-w-0 ${fit ? "items-center justify-center" : `w-full ${alignClass[cell.align ?? "center"]}`}`}
      onClick={() => onOpen(img.filename)}
    >
      <img
        src={cdnUrl(serie.serie_slug, img.filename, width)}
        alt={`${serie.serie_name} — ${img.filename}`}
        loading="lazy"
        className={
          fit
            ? // diptico: altura fija (duplas parejas) + tope de ancho por foto (mitad)
              "cursor-pointer h-[80vh] w-auto max-w-[45vw] object-contain"
            : "w-full h-auto cursor-pointer"
        }
      />
    </div>
  );
}

export function EditorialLayout({
  serie,
  onOpen,
}: {
  serie: Serie;
  onOpen: (filename: string) => void;
}) {
  const { t } = useI18n();
  const layout = serie.layout ?? {};
  const rows = layout.rows ?? [];
  const photoFns = serie.images
    .filter((i) => i.type === "photo")
    .map((i) => (i as PhotoItem).data.filename);

  // defaults: cover = 1ra foto, el resto una fila full-width por foto
  const cover = layout.cover ?? photoFns[0];
  const effRows: LayoutRow[] =
    rows.length > 0
      ? rows
      : photoFns.filter((f) => f !== cover).map((f) => ({ cells: [{ photo: f }] }));

  return (
    <div className="min-h-screen">
      {/* Hero: cover full-bleed con título superpuesto */}
      <section className="relative w-screen h-screen">
        <img
          src={cdnUrl(serie.serie_slug, cover, 2000)}
          alt={`${serie.serie_name} — cover`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: layout.cover_object_position ?? "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <h1 className="absolute bottom-20 left-6 md:bottom-14 md:left-12 text-white text-4xl md:text-7xl font-light tracking-tight max-w-[85%]">
          {t(serie.serie_name, serie.serie_name_es)}
          <span className="block text-lg md:text-2xl text-white/80 mt-2 font-pt-mono">
            {serie.year}
          </span>
        </h1>
      </section>

      {/* Slots */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {effRows.map((row, i) => {
          const n = row.cells.length;
          const textOnly = n === 1 && !!row.cells[0].text;
          return (
            <section
              key={`row-${i}`}
              className={
                n === 2 && !textOnly
                  ? // diptico: ambas fotos entran en el viewport, juntas y centradas
                    // bg configurable por serie (layout.diptic_bg) para fotos claras
                    `flex h-screen items-center justify-center px-4 md:px-8 ${layout.diptic_bg ? "text-white" : ""}`
                  : `flex min-h-[75vh] items-center ${n === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`
              }
              style={
                n === 2 && !textOnly && layout.diptic_bg
                  ? { backgroundColor: layout.diptic_bg }
                  : undefined
              }
            >
              {textOnly && <div className="hidden md:block" />}
              {n === 2 && !textOnly ? (
                // diptico: fotos juntas con una línea fina entre ellas
                <div className="flex items-center justify-center max-w-full">
                  {row.cells.map((cell, j) => (
                    <Fragment key={`cell-${i}-${j}`}>
                      {j > 0 && (
                        <div
                          className="w-px self-stretch"
                          style={{
                            backgroundColor: layout.diptic_bg
                              ? "rgba(255,255,255,0.25)"
                              : "var(--color-outline-variant)",
                          }}
                        />
                      )}
                      <Cell
                        serie={serie}
                        cell={cell}
                        width={900}
                        fit
                        onOpen={onOpen}
                      />
                    </Fragment>
                  ))}
                </div>
              ) : (
                row.cells.map((cell, j) => (
                  <Cell
                    key={`cell-${i}-${j}`}
                    serie={serie}
                    cell={cell}
                    width={1600}
                    onOpen={onOpen}
                  />
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
