"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import type { Serie, ImageData, LightboxMode, SeriesItem, PhotoItem, TextItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useSwipe } from "@/hooks/useSwipe";
import { ScatterWordsLayer } from "@/components/ScatterWordsLayer";

interface LightboxProps {
  serie: Serie;
  initialIndex: number;
  onClose: () => void;
}

/* ── animation variants ── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "30%" : "-30%", opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "30%", opacity: 0, scale: 0.97 }),
};
const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/* ── prose text: simple markdown → HTML ── */
function mdToHtml(md: string): string {
  return md
    .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

/* ── render scatter text (words positioned on a full-screen canvas) ── */
function ScatterSlide({ item }: { item: TextItem }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh]" style={{ aspectRatio: item.canvas ? item.canvas.width / item.canvas.height : undefined }}>
        {item.words?.map((w, i) => (
          <div
            key={i}
            className={`absolute whitespace-nowrap pointer-events-none ${w.class ?? "word-body"}`}
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
    </div>
  );
}

/* ── render prose text full-screen ── */
function ProseSlide({ item }: { item: TextItem }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-surface-container ${item.class ?? ""}`}>
      <div
        className="text-slide-prose"
        style={{ textAlign: item.align ?? "center" }}
        dangerouslySetInnerHTML={{ __html: mdToHtml(item.content_md ?? "") }}
      />
    </div>
  );
}

/* ── TextOverlay badge on a photo ── */
function OverlayBadge({ overlay, serieSlug }: { overlay: import("@/types").TextOverlay; serieSlug: string }) {
  const posClass: Record<string, string> = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };
  return (
    <div
      className={`absolute z-10 pointer-events-none ${posClass[overlay.position] ?? "bottom-4 left-4"} ${overlay.class ?? ""}`}
      dangerouslySetInnerHTML={{ __html: mdToHtml(overlay.text_md) }}
    />
  );
}

export function Lightbox({ serie, initialIndex, onClose }: LightboxProps) {
  const { t } = useI18n();

  // Resolve items
  const items: SeriesItem[] = useMemo(
    () => serie.items ?? serie.images.map((img) => ({ type: "photo" as const, data: img })),
    [serie.items, serie.images]
  );

  const isMixed = items.some((it) => it.type !== "photo");

  const configuredMode = serie.lightbox_mode ?? "single";
  const [mode, setMode] = useState<LightboxMode>(configuredMode);
  const [current, setCurrent] = useState(initialIndex);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideshowTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const autoplayInterval = serie.lightbox_autoplay_interval ?? 4000;

  const total = items.length;
  const step = (mode === "flipbook" || mode === "compare") && !isMixed ? 2 : 1;
  const maxIndex = step > 1 ? Math.max(0, total - 2) : total - 1;

  const currentItem = items[current];
  const isPhoto = currentItem?.type === "photo";
  const isText = currentItem?.type === "text";

  /* ── navigation ── */
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => Math.min(prev + step, maxIndex));
    setSlideshowProgress(0);
  }, [step, maxIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => Math.max(prev - step, 0));
    setSlideshowProgress(0);
  }, [step]);

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.min(idx, maxIndex);
      setDirection(clamped > current ? 1 : -1);
      setCurrent(clamped);
      setSlideshowProgress(0);
    },
    [maxIndex, current]
  );

  /* ── keyboard ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  /* ── body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── slideshow timer ── */
  useEffect(() => {
    if (mode !== "slideshow") {
      setSlideshowPlaying(false);
      setSlideshowProgress(0);
      return;
    }
    setSlideshowPlaying(true);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode]);

  useEffect(() => {
    if (!slideshowPlaying || mode !== "slideshow") return;

    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setSlideshowProgress(Math.min((elapsed / autoplayInterval) * 100, 100));
      if (elapsed >= autoplayInterval) { goNext(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [slideshowPlaying, mode, autoplayInterval, goNext]);

  const toggleSlideshow = useCallback(() => {
    setSlideshowPlaying((p) => !p);
    setSlideshowProgress(0);
  }, []);

  /* ── swipe ── */
  const swipeHandlers = useSwipe(
    useMemo(() => ({ onSwipeLeft: goNext, onSwipeRight: goPrev }), [goNext, goPrev])
  );

  /* ── mode cycle ── */
  const cycleMode = useCallback(() => {
    const modes: LightboxMode[] = ["single", "flipbook", "slideshow", "compare"];
    const idx = modes.indexOf(mode);
    const next = modes[(idx + 1) % modes.length];
    const newStep = (next === "flipbook" || next === "compare") && !isMixed ? 2 : 1;
    const newMax = newStep > 1 ? Math.max(0, total - 2) : total - 1;
    setCurrent((prev) => Math.min(prev, newMax));
    setMode(next);
    setDirection(1);
    setSlideshowProgress(0);
  }, [mode, total, isMixed]);

  /* ── compare slider ── */
  const [comparePos, setComparePos] = useState(50);
  const compareDrag = useRef(false);
  const onCompareMouseDown = useCallback(() => { compareDrag.current = true; }, []);
  const onCompareMouseUp = useCallback(() => { compareDrag.current = false; }, []);
  const onCompareMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!compareDrag.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setComparePos(Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100)));
    }, []
  );
  const onCompareTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setComparePos(Math.max(10, Math.min(90, ((e.touches[0].clientX - rect.left) / rect.width) * 100)));
    }, []
  );

  const canGoNext = current < maxIndex;
  const canGoPrev = current > 0;

  /* ── render helpers ── */

  function renderOverlays(photo: PhotoItem) {
    if (!photo.overlays?.length) return null;
    return photo.overlays.map((ov, i) => (
      <OverlayBadge key={i} overlay={ov} serieSlug={serie.serie_slug} />
    ));
  }

  function renderSinglePhoto(photo: PhotoItem, idx: number) {
    const img = photo.data;
    return (
      <motion.div
        key={idx}
        custom={direction}
        variants={slideVariants}
        initial="enter" animate="center" exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {serie.show_lightbox_title && img.title && (
          <div className="absolute top-2 left-2 right-2 z-10 text-center pointer-events-none">
            <p className="font-pt-mono text-sm md:text-lg drop-shadow-lg">{img.title}</p>
          </div>
        )}
        <Image
          src={`/images/${serie.serie_slug}/${img.filename}`}
          alt={`${serie.serie_name} — ${img.filename}`}
          width={1200} height={900}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          sizes="100vw"
          priority
        />
        {photo.words && <ScatterWordsLayer words={photo.words} />}
        {renderOverlays(photo)}
        {serie.show_lightbox_footer && img.description && (
          <div className="absolute bottom-2 left-2 right-2 z-10 text-center pointer-events-none">
            <p className="font-sans text-sm text-white/60 drop-shadow-lg">{img.description}</p>
          </div>
        )}
      </motion.div>
    );
  }

  function renderFlipbook() {
    const leftItem = items[current] as PhotoItem;
    const leftImg = leftItem.data;
    const rightIdx = Math.min(current + 1, total - 1);
    const rightItem = items[rightIdx]?.type === "photo" ? (items[rightIdx] as PhotoItem) : leftItem;
    const rightImg = rightItem.data;
    const isSingle = leftItem === rightItem;

    return (
      <motion.div
        key={`spread-${current}`}
        custom={direction}
        variants={slideVariants}
        initial="enter" animate="center" exit="exit"
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute inset-0 flex"
      >
        <div className="absolute inset-0 z-[5] pointer-events-none flex">
          <div className="w-1/2" />
          <div className="w-1/2 bg-gradient-to-r from-black/30 to-transparent" />
        </div>
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {serie.show_lightbox_title && leftImg.title && (
            <div className="absolute top-2 left-2 right-2 z-10 text-center pointer-events-none">
              <p className="font-pt-mono text-sm md:text-lg drop-shadow-lg">{leftImg.title}</p>
            </div>
          )}
          <Image src={`/images/${serie.serie_slug}/${leftImg.filename}`} alt="" width={1200} height={900}
            className="max-w-full max-h-full w-auto h-auto object-contain" sizes="50vw" priority />
          {leftItem.words && <ScatterWordsLayer words={leftItem.words} />}
        </div>
        <div className="w-px bg-white/10 flex-shrink-0 relative z-10" />
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {!isSingle && serie.show_lightbox_title && rightImg.title && (
            <div className="absolute top-2 left-2 right-2 z-10 text-center pointer-events-none">
              <p className="font-pt-mono text-sm md:text-lg drop-shadow-lg">{rightImg.title}</p>
            </div>
          )}
          <Image src={`/images/${serie.serie_slug}/${rightImg.filename}`} alt="" width={1200} height={900}
            className="max-w-full max-h-full w-auto h-auto object-contain" sizes="50vw" priority />
          {rightItem.words && <ScatterWordsLayer words={rightItem.words} />}
        </div>
        <div className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 pointer-events-none z-[6]">
          <div className="w-full h-full bg-gradient-to-r from-black/20 via-black/10 to-transparent" />
        </div>
      </motion.div>
    );
  }

  function renderCompare() {
    const leftItem = items[current] as PhotoItem;
    const rightIdx = Math.min(current + 1, total - 1);
    const rightItem = items[rightIdx] as PhotoItem;
    const leftImg = leftItem.data;
    const rightImg = rightItem.data;

    return (
      <motion.div
        key={`compare-${current}`}
        custom={direction}
        variants={slideVariants}
        initial="enter" animate="center" exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0"
        onMouseMove={onCompareMouseMove}
        onMouseUp={onCompareMouseUp}
        onMouseLeave={onCompareMouseUp}
        onTouchMove={onCompareTouchMove}
      >
        {/* RIGHT — background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src={`/images/${serie.serie_slug}/${rightImg.filename}`} alt="" width={1200} height={900}
            className="max-w-full max-h-full w-auto h-auto object-contain" sizes="100vw" priority />
          {rightItem.words && <ScatterWordsLayer words={rightItem.words} />}
          {renderOverlays(rightItem)}
        </div>
        {/* LEFT — clipped overlay */}
        <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={`/images/${serie.serie_slug}/${leftImg.filename}`} alt="" width={1200} height={900}
              className="max-w-full max-h-full w-auto h-auto object-contain" sizes="100vw" priority />
            {leftItem.words && <ScatterWordsLayer words={leftItem.words} />}
            {renderOverlays(leftItem)}
          </div>
        </div>
        {/* Divider handle */}
        <div className="absolute top-0 bottom-0 z-20 flex items-center cursor-col-resize select-none"
          style={{ left: `${comparePos}%`, transform: "translateX(-50%)" }}
          onMouseDown={onCompareMouseDown}>
          <div className="w-0.5 h-full bg-white/60 shadow-lg" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M8 3L8 21M16 3L16 21" />
            </svg>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Central renderer: decides what to show ── */
  function renderContent() {
    if (!currentItem) return null;

    if (currentItem.type === "text") {
      const ti = currentItem as TextItem;
      return (
        <motion.div
          key={`text-${current}`}
          variants={fadeVariants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {ti.layout === "scatter" ? <ScatterSlide item={ti} /> : <ProseSlide item={ti} />}
        </motion.div>
      );
    }

    // Photo item
    const photo = currentItem as PhotoItem;
    switch (mode) {
      case "flipbook": return renderFlipbook();
      case "compare": return renderCompare();
      case "slideshow":
      case "single":
      default: return renderSinglePhoto(photo, current);
    }
  }

  /* ── Mode label icons ── */
  const modeLabel: Record<LightboxMode, string> = {
    single: "1:1", flipbook: "📖", slideshow: "▶", compare: "⇔",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      ref={containerRef}
      {...swipeHandlers}
    >
      {/* Slideshow progress */}
      {mode === "slideshow" && isPhoto && (
        <div className="absolute top-0 left-0 right-0 z-30 h-0.5 bg-white/10">
          <motion.div className="h-full bg-white/60" style={{ width: `${slideshowProgress}%` }} transition={{ duration: 0.05 }} />
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between z-20">
        <p className="font-pt-mono text-xs md:text-sm text-white/40 uppercase tracking-widest">
          {t(serie.serie_name, serie.serie_name_es)} — {serie.year}
          <span className="mx-2 text-white/20">|</span>
          {current + 1}/{total}
          {isPhoto && (mode === "flipbook" || mode === "compare") && (
            <span className="ml-2 text-white/30">
              spread {Math.floor(current / 2) + 1}/{Math.ceil(total / 2)}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {/* Mode toggle (only show for photo series) */}
          {!isMixed && (
            <button onClick={cycleMode}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors text-xs font-pt-mono rounded hover:bg-white/5"
              title={`Mode: ${mode}`}>
              {modeLabel[mode]}
            </button>
          )}
          {mode === "slideshow" && isPhoto && (
            <button onClick={toggleSlideshow}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
              aria-label={slideshowPlaying ? "Pause" : "Play"}>
              {slideshowPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 relative min-h-0 select-none"
        onMouseUp={mode === "compare" && isPhoto ? onCompareMouseUp : undefined}>
        {canGoPrev && (
          <button onClick={goPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <AnimatePresence mode={mode === "compare" && isPhoto ? "sync" : "wait"} custom={direction}>
          {renderContent()}
        </AnimatePresence>

        {canGoNext && (
          <button onClick={goNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* ── FOOTER: thumbnail strip ── */}
      {serie.show_thumbnails && (
        <div className="flex-shrink-0 border-t border-white/10 py-2 md:py-3 px-2 md:px-4 overflow-x-auto z-20">
          <div className="flex gap-1.5 md:gap-2 justify-center">
            {items.map((item: SeriesItem, idx: number) => {
              if (item.type === "photo") {
                const img = (item as PhotoItem).data;
                const isSpread = mode === "flipbook" || mode === "compare";
                const isActive = isSpread
                  ? (idx === current || idx === Math.min(current + 1, total - 1))
                  : idx === current;
                return (
                  <button key={img.filename}
                    onClick={() => goTo(isSpread ? (idx % 2 === 0 ? idx : idx - 1) : idx)}
                    className={`relative flex-shrink-0 w-12 h-12 md:w-20 md:h-20 overflow-hidden transition-all ${
                      isActive ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"
                    }`}>
                    <Image src={`/images/${serie.serie_slug}/${img.filename}`} alt="" fill
                      className="object-cover" sizes="(min-width: 768px) 80px, 48px" />
                  </button>
                );
              }
              // Text item thumbnail indicator
              return (
                <button key={`text-thumb-${idx}`}
                  onClick={() => goTo(idx)}
                  className={`flex-shrink-0 w-12 h-12 md:w-20 md:h-20 flex items-center justify-center bg-surface-container transition-all text-white/40 font-pt-mono text-xs ${
                    idx === current ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"
                  }`}>
                  ¶
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}