"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/hooks/useI18n";
import { useNerdMode } from "@/hooks/useNerdMode";
import { siteConfig as config, allCategories } from "@/data/config";
import { useState } from "react";

export function Header() {
  const { locale, toggleLocale, t } = useI18n();
  const { nerdMode, toggleNerdMode } = useNerdMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const nerdIconSrc = "/icons/nerd-off.png";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-8 py-2.5">
          {/* Left: Name */}
          <Link
            href="/"
            className="font-pt-mono text-base md:text-base tracking-wider hover:text-gray-300 transition-colors"
          >
            Pablo Tutino
          </Link>

          {/* Center: Category links — desktop only */}
          <nav className="hidden md:flex items-center gap-5">
            {allCategories.map((cat) => (
              <Link
                key={cat.category_slug}
                href={`/${cat.category_slug}`}
                className="font-sans text-tiny uppercase tracking-widest hover:text-gray-300 transition-colors"
              >
                {cat.title_es ? t(cat.title, cat.title_es) : cat.title}
              </Link>
            ))}
          </nav>

          {/* Right: Nerd + lang + about — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <Link
                href="/about"
                className="font-pt-mono px-1.5 py-0.5 hover:text-gray-300 transition-colors text-tiny"
              >
                INFO
            </Link>
            <button
              onClick={toggleNerdMode}
              className={`flex items-center justify-center p-1 border transition-colors ${
                nerdMode
                  ? "border-white bg-white"
                  : "border-white/30 hover:border-white"
              }`}
              title="Nerd Mode"
            >
              <Image
                src={nerdIconSrc}
                alt="Nerd Mode"
                width={24}
                height={24}
                className={`transition-all duration-200 ${
                  nerdMode ? "" : "invert"
                }`}
              />
            </button>
            <button
              onClick={toggleLocale}
              className="font-pt-mono px-1.5 py-0.5 border border-white/30 hover:border-white transition-colors text-tiny"
            >
              {locale.toUpperCase()}
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </header>

      {/* Fullscreen mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-6 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          {/* NRD + Language toggles */}
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); toggleNerdMode(); }}
              className={`flex items-center justify-center p-1.5 border transition-colors ${
                nerdMode
                  ? "border-white bg-white"
                  : "border-white/30 hover:border-white"
              }`}
              title="Nerd Mode"
            >
              <Image
                src={nerdIconSrc}
                alt="Nerd Mode"
                width={32}
                height={32}
                className={`transition-all duration-200 ${
                  nerdMode ? "" : "invert"
                }`}
              />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLocale(); }}
              className="font-pt-mono px-3 py-1 border border-white/30 hover:border-white transition-colors text-lg"
            >
              {locale.toUpperCase()}
            </button>
          </div>

          {/* Separator */}
          <div className="w-16 h-px bg-white/20" />

          {/* Categories */}
          {allCategories.map((cat) => (
            <Link
              key={cat.category_slug}
              href={`/${cat.category_slug}`}
              className="font-pt-mono text-base uppercase tracking-widest hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {cat.title_es ? t(cat.title, cat.title_es) : cat.title}
            </Link>
          ))}

          {/* Separator */}
          <div className="w-16 h-px bg-white/20" />

          {/* Info link */}
          <Link
            href="/about"
            className="font-pt-mono text-base uppercase tracking-widest hover:text-gray-300 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            INFO
          </Link>
        </div>
      )}
    </>
  );
}
