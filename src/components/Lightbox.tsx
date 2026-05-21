"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Serie, ImageData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

interface LightboxProps {
  serie: Serie;
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ serie, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const images = serie.images;
  const img: ImageData = images[current];
  const { t } = useI18n();

  const goNext = useCallback(
    () => setCurrent((prev) => (prev + 1) % images.length),
    [images.length]
  );
  const goPrev = useCallback(
    () => setCurrent((prev) => (prev - 1 + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const src = `/images/${serie.serie_slug}/${img.filename}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* HEADER: serie title + close */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between z-20">
        <p className="font-pt-mono text-xs md:text-sm text-white/40 uppercase tracking-widest">
          {t(serie.serie_name, serie.serie_name_es)} — {serie.year}
        </p>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* CONTENT: photo fills entire area, arrows overlay */}
      <div className="flex-1 relative min-h-0">
        {/* Prev arrow */}
        <button
          onClick={goPrev}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Photo fills the content div */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Photo title (per-image, if enabled) */}
            {serie.show_lightbox_title && img.title && (
              <div className="absolute top-2 left-2 right-2 z-10 text-center pointer-events-none">
                <p className="font-pt-mono text-sm md:text-lg drop-shadow-lg">{img.title}</p>
              </div>
            )}

            <Image
              src={src}
              alt={`${serie.serie_name} — ${img.filename}`}
              width={1200}
              height={900}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              sizes="100vw"
            />

            {/* Photo description footer (per-image, if enabled) */}
            {serie.show_lightbox_footer && img.description && (
              <div className="absolute bottom-2 left-2 right-2 z-10 text-center pointer-events-none">
                <p className="font-sans text-sm text-white/60 drop-shadow-lg">{img.description}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button
          onClick={goNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          aria-label="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* FOOTER: thumbnail strip */}
      {serie.show_thumbnails && (
        <div className="flex-shrink-0 border-t border-white/10 py-2 md:py-3 px-2 md:px-4 overflow-x-auto z-20">
          <div className="flex gap-1.5 md:gap-2 justify-center">
            {images.map((thumbImg: ImageData, idx: number) => (
              <button
                key={thumbImg.filename}
                onClick={() => setCurrent(idx)}
                className={`relative flex-shrink-0 w-12 h-12 md:w-20 md:h-20 overflow-hidden transition-all ${
                  idx === current
                    ? "ring-2 ring-white opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <Image
                  src={`/images/${serie.serie_slug}/${thumbImg.filename}`}
                  alt={thumbImg.filename}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 80px, 48px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
