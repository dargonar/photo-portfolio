"use client";

import { useEffect, useState, useCallback } from "react";
import type { Serie } from "@/types";
import { useI18n } from "@/hooks/useI18n";

const CDN = "https://res.cloudinary.com/dhr3jdnve/image/upload";

function cdnUrl(serieSlug: string, filename: string, width: number) {
  // f_webp en vez de f_auto: f_auto puede servir AVIF y romper decoders sin soporte
  return `${CDN}/q_auto,f_webp/c_limit,w_${width}/${serieSlug}/${filename.replace(/\.[^.]+$/, "")}`;
}

/**
 * Lightbox editorial (estilo Bettman):
 * - overlay claro lavado (la página sigue visible detrás)
 * - foto centrada sobre mate, ~80vh
 * - UI mínima circular: ‹ › a media altura, ✕ arriba derecha
 * - sin caption/contador/EXIF; flechas navegan, ESC cierra
 * - Modo diptico: si la serie tiene rows de 2 fotos, el visor muestra pares
 *   (las 2 fotos juntas al centro, como en la página). Navega de par a par.
 */
export function EditorialLightbox({
  serie,
  filenames,
  initialFilename,
  onClose,
}: {
  serie: Serie;
  filenames: string[];
  initialFilename: string;
  onClose: () => void;
}) {
  const { t } = useI18n();

  const pairs = serie.layout?.rows?.length
    ? serie.layout.rows
        .filter((r) => r.cells.length === 2 && r.cells.every((c) => c.photo))
        .map((r) => [r.cells[0].photo!, r.cells[1].photo!])
        .filter((p) => p.every((f) => filenames.includes(f)))
    : [];

  const [idx, setIdx] = useState(() => {
    if (pairs.length) {
      const i = pairs.findIndex((p) => p.includes(initialFilename));
      return i >= 0 ? i : 0;
    }
    const i = filenames.indexOf(initialFilename);
    return i >= 0 ? i : 0;
  });
  const [loaded, setLoaded] = useState(false);

  const n = pairs.length || filenames.length;
  const goPrev = useCallback(
    () => setIdx((i) => (i - 1 + n) % n),
    [n]
  );
  const goNext = useCallback(
    () => setIdx((i) => (i + 1) % n),
    [n]
  );

  useEffect(() => setLoaded(false), [idx]);

  // teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev]);

  // bloquear scroll del body mientras está abierto (al cerrar vuelve al scroll exacto)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // precargar vecinas
  useEffect(() => {
    const next = pairs.length ? pairs[(idx + 1) % pairs.length] : filenames[(idx + 1) % filenames.length];
    const prev = pairs.length ? pairs[(idx - 1 + pairs.length) % pairs.length] : filenames[(idx - 1 + filenames.length) % filenames.length];
    [...next, ...prev].forEach((f) => {
      const im = new Image();
      im.src = cdnUrl(serie.serie_slug, f, 2000);
    });
  }, [idx, filenames, pairs, serie.serie_slug]);

  const btn =
    "w-11 h-11 rounded-full flex items-center justify-center bg-white/80 text-neutral-900 border border-neutral-300 hover:bg-white hover:border-neutral-500 transition-all select-none";

  const isDiptic = pairs.length > 0;
  const shown = isDiptic ? pairs[idx] : [filenames[idx]];

  return (
    <div
      className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t("Photo viewer", "Visor de fotos")}
    >
      {/* foto(s) centrada(s) sobre mate — diptico: las 2 juntas con línea fina */}
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
        <div
          className="flex items-center"
          style={
            isDiptic
              ? { backgroundColor: serie.layout?.diptic_bg ?? "transparent", padding: "2rem 2.5rem" }
              : undefined
          }
        >
          {shown.map((f, j) => (
            <div key={f} className="flex items-center">
              {j > 0 && (
                <div
                  className="w-px self-stretch"
                  style={{
                    backgroundColor: serie.layout?.diptic_bg
                      ? "rgba(255,255,255,0.25)"
                      : "var(--color-outline-variant)",
                  }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={f}
                src={cdnUrl(serie.serie_slug, f, 2000)}
                alt={f}
                onLoad={() => setLoaded(true)}
                className={`${
                  isDiptic ? "h-[80vh] w-auto max-w-[45vw]" : "max-h-[80vh] max-w-full"
                } object-contain transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* UI mínima circular */}
      <button
        aria-label={t("Close", "Cerrar")}
        onClick={onClose}
        className={`${btn} absolute top-4 right-4 z-10`}
      >
        ✕
      </button>
      <button
        aria-label={t("Previous", "Anterior")}
        onClick={goPrev}
        className={`${btn} absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10`}
      >
        ‹
      </button>
      <button
        aria-label={t("Next", "Siguiente")}
        onClick={goNext}
        className={`${btn} absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10`}
      >
        ›
      </button>
    </div>
  );
}
