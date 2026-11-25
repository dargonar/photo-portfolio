"use client";

import { useState, useCallback, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { siteConfig as config } from "@/data/config";
import type { Serie } from "@/types";
import { useI18n } from "@/hooks/useI18n";

function getSerie(slug: string): Serie | undefined {
  return config.series.find((s) => s.serie_slug === slug);
}

function getImagePath(serie: Serie, filename: string): string {
  return `${serie.serie_slug}/${filename.replace(/\.[^.]+$/, "")}`;
}

export function Carousel() {
  const [images, setImages] = useState(config.pages.home.carousel.images);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Autoplay — advance every transition_interval_s seconds
  useEffect(() => {
    const interval = (config.pages.home.carousel.transition_interval_s ?? 5) * 1000;
    if (paused) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [goNext, paused]);

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
  const isProject = serie.category_slug === config.categories.projects.category_slug;
  const seriePath = serie.category_slug === config.categories.projects.category_slug
    ? `/projects/${serie.serie_slug}`
    : `/series/${serie.serie_slug}`;

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
        onClick={() => { setPaused(true); goPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/40 p-4 hover:bg-black/80 transition-all border border-transparent hover:border-white"
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => { setPaused(true); goNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/40 p-4 hover:bg-black/80 transition-all border border-transparent hover:border-white"
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Clickable image → series/project page */}
      <Link href={seriePath} className="absolute inset-0 z-[5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.serie_slug}-${item.filename}`}
            initial={tv.initial}
            animate={tv.animate}
            exit={tv.exit}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <CldImage
              src={src}
              alt={`${serie.serie_name} — ${item.filename}`}
              fill
              className="object-cover"
              style={{ objectPosition: item.object_position ?? "center" }}
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </Link>

      {/* Serie name over photo — bottom-left, scrim gradient. Mobile: 50% width. */}
      <div className="absolute bottom-[72px] left-0 z-20 w-1/2 md:w-auto pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative p-4 md:p-6 md:pl-12">
          <h2 className="text-white text-3xl md:text-5xl font-light tracking-tight leading-tight">
            {t(serie.serie_name, serie.serie_name_es)}
          </h2>
          <p className="font-pt-mono text-lg md:text-xl text-white/80 mt-2">{serie.year}</p>
        </div>
      </div>

      {/* Dots + pause/play — desktop: centered. Mobile: right half, left-aligned */}
      <div className="absolute bottom-[72px] left-1/2 right-0 md:right-auto md:-translate-x-1/2 z-20 flex items-center gap-4 bg-black/35 rounded-full px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          {images.map((img, i) => (
            <button
              key={`${img.serie_slug}-${img.filename}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play carousel" : "Pause carousel"}
          className="text-white/60 hover:text-white transition-colors"
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
          )}
        </button>
      </div>

      {/* Footer overlay — same as global footer (instagram, github, email), sin ABOUT */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-glass-bg backdrop-blur-md border-t border-outline-variant flex justify-center items-center gap-6 px-gutter p-4">
        <a href="https://www.instagram.com/pablotutino" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
        </a>
        <a href="https://github.com/dargonar" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
        </a>
        <a href="mailto:pablo.tutino@gmail.com" className="hover:opacity-70 transition-opacity" aria-label="Email">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" ry="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
        </a>
      </div>
    </div>
  );
}
