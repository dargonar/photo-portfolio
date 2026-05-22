"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { siteConfig as config } from "@/data/config";
import type { Serie } from "@/types";
import { useI18n } from "@/hooks/useI18n";

function getSerie(slug: string): Serie | undefined {
  return config.series.find((s) => s.serie_slug === slug);
}

function getImagePath(serie: Serie, filename: string): string {
  return `/images/${serie.serie_slug}/${filename}`;
}

export function Carousel() {
  const [images, setImages] = useState(config.pages.home.carousel.images);
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const { t } = useI18n();

  const goNext = useCallback(
    () => setCurrent((prev) => (prev + 1) % total),
    [total]
  );
  const goPrev = useCallback(
    () => setCurrent((prev) => (prev - 1 + total) % total),
    [total]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Switch image set on resize across 1024px boundary (+ initial check)
  useEffect(() => {
    const update = () => {
      const wide = window.innerWidth >= 1024;
      const next = config.pages.home.carousel.images_mobile && !wide
        ? config.pages.home.carousel.images_mobile
        : config.pages.home.carousel.images;
      setImages(next);
      setCurrent((c) => Math.min(c, next.length - 1));
    };
    update(); // initial run (SSR-safe: window exists client-side only)
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const item = images[current];
  const serie = getSerie(item.serie_slug);
  if (!serie) return null;

  const src = getImagePath(serie, item.filename);
  const transition = serie.carousel_transition || "fade";

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    book: {
      initial: { opacity: 0, rotateY: -90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: 90 },
    },
  };

  const tv = variants[transition] || variants.fade;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">

      {/* Nav arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 p-4 hover:bg-black/80 transition-all border border-transparent hover:border-white"
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 p-4 hover:bg-black/80 transition-all border border-transparent hover:border-white"
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${item.serie_slug}-${item.filename}`}
          initial={tv.initial}
          animate={tv.animate}
          exit={tv.exit}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={`${serie.serie_name} — ${item.filename}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Footer overlay — glass bg, fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-glass-bg backdrop-blur-md border-t border-outline-variant px-gutter p-4">
        <div className="flex items-center gap-6 max-w-screen-xl mx-auto">
          <span className="font-data-mono text-data-mono text-terminal-green">
            {pad(current + 1)} / {pad(total)}
          </span>
          <Link
            href={`/${serie.category_slug}/${serie.serie_slug}`}
            className="font-label-sm text-label-sm tracking-[0.1em] uppercase text-primary hover:text-on-surface-variant transition-colors"
          >
            {t(serie.serie_name, serie.serie_name_es)} — {serie.year}
          </Link>
        </div>
      </div>
    </div>
  );
}
