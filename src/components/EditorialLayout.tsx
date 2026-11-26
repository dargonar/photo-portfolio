"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
  if (slot.layout === "columns") {
    // texto largo a dos columnas (colofón): título estilo hero, interlineado
    // doble, 1 columna en mobile / 2 en desktop (CSS columns: el texto fluye)
    return (
      <div className={`w-full ${slot.class ?? ""}`}>
        {slot.title && (
          <h2 className="text-3xl md:text-5xl font-light text-primary mb-10">
            {t(slot.title ?? "", slot.title_es ?? "")}
          </h2>
        )}
        <div
          // mismo ancho que el grid de credits (2 columnas gap-x-8) y misma
          // fuente (font-pt-mono text-sm); contenido HTML crudo para <i> etc.
          className="font-pt-mono text-sm leading-8 md:columns-2 md:gap-8"
          dangerouslySetInnerHTML={{ __html: t(slot.content_md ?? "", slot.content_md_es ?? "") }}
        />
      </div>
    );
  }
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
  pairW,
  onLoad,
  onOpen,
}: {
  serie: Serie;
  cell: LayoutCell;
  width: number;
  fit?: boolean;
  pairW?: number | null;
  onLoad?: () => void;
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
        onLoad={onLoad}
        className={
          fit
            ? // diptico: ambas fotos comparten el mismo ancho (pairW), dentro de su mitad
              pairW
              ? "cursor-pointer max-h-[80vh] object-contain"
              : "cursor-pointer max-h-[85vh] w-auto max-w-full object-contain"
            : "w-full h-auto cursor-pointer"
        }
        style={fit && pairW ? { width: `${pairW}px` } : undefined}
      />
    </div>
  );
}

/* ── diptico: las 2 fotos comparten el mismo ancho (el más angosto de las
   dos, limitado a 45vw y a 80vh de alto) — así cada foto queda dentro del
   50% del espacio del par y las landscape no agrandan el par ── */
function DipticPair({
  serie,
  row,
  onOpen,
}: {
  serie: Serie;
  row: LayoutRow;
  onOpen: (filename: string) => void;
}) {
  const layout = serie.layout ?? {};
  const ref = useRef<HTMLDivElement>(null);
  const [pairW, setPairW] = useState<number | null>(null);
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const imgs = Array.from(el.querySelectorAll("img"));
    if (!imgs.length || !imgs.every((i) => i.complete && i.naturalWidth > 0)) return;
    if (window.innerWidth < 768) {
      // mobile: apiladas — cada foto mantiene su tamaño individual (sin ancho
      // compartido); solo se unen tocándose con la línea entre ellas
      setPairW(null);
      return;
    }
    const caps = imgs.map((i) =>
      Math.min(
        0.45 * window.innerWidth,
        0.8 * window.innerHeight * (i.naturalWidth / i.naturalHeight)
      )
    );
    setPairW(Math.min(...caps));
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div ref={ref} className="flex flex-col md:flex-row items-center justify-center max-w-full">
      {row.cells.map((cell, j) => (
        <Fragment key={`cell-${j}`}>
          {j > 0 && (
            <div
              className="h-px w-full md:h-auto md:w-px md:self-stretch"
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
            pairW={pairW}
            onLoad={measure}
            onOpen={onOpen}
          />
        </Fragment>
      ))}
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

      {/* Slots — mismo bg que las secciones (diptic_bg), para que la grilla
          entera (incluidas filas individuales y texto) esté sobre ese fondo */}
      <div
        className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8"
        style={
          layout.diptic_bg
            ? { backgroundColor: layout.diptic_bg }
            : undefined
        }
      >
        {effRows.map((row, i) => {
          const n = row.cells.length;
          const textOnly = n === 1 && !!row.cells[0].text;
          // texto tras texto (statement → credits): el padding-top de la fila
          // de abajo es redundante (la de arriba ya aporta pb-16/24) → pt-0
          const prevTextOnly = i > 0 && effRows[i - 1].cells.length === 1 && !!effRows[i - 1].cells[0].text;
          return (
            <section
              key={`row-${i}`}
              className={
                n === 2 && !textOnly
                  ? // diptico: ambas fotos entran en el viewport, juntas y centradas
                    // bg configurable por serie (layout.diptic_bg) para fotos claras
                    // mobile: el par apilado puede exceder la pantalla (min-h)
                    `flex min-h-screen items-center justify-center px-4 md:px-8 py-16 md:py-0 ${layout.diptic_bg ? "text-white" : ""}`
                  : // fila individual: foto completa en el viewport, centrada, espaciada
                    `flex min-h-[85vh] items-center justify-center px-4 md:px-8 ${prevTextOnly ? "pb-16 md:pb-24" : "py-16 md:py-24"}`
              }
            >
              {textOnly && <div className="hidden md:block" />}
              {n === 2 && !textOnly ? (
                // diptico: fotos juntas con una línea fina entre ellas
                <DipticPair serie={serie} row={row} onOpen={onOpen} />
              ) : (
                row.cells.map((cell, j) => (
                  <Cell
                    key={`cell-${i}-${j}`}
                    serie={serie}
                    cell={cell}
                    width={1600}
                    fit={!textOnly}
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
