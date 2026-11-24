"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

export function Header() {
  const { locale, toggleLocale } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-glass-bg backdrop-blur-xs border-b border-outline-variant flex justify-between items-center px-gutter p-4">
        <Link
          href="/?no-splash"
          className="font-headline-lg-mobile text-headline-lg-mobile tracking-widest text-primary"
        >
          Pablo Tutino
        </Link>

        {/* Navegación inline (desktop): WORK, ABOUT, language */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/work"
            className="font-label-sm text-label-sm tracking-[0.2em] uppercase text-primary hover:text-secondary transition-colors"
          >
            WORK
          </Link>
          <Link
            href="/about"
            className="font-label-sm text-label-sm tracking-[0.2em] uppercase text-primary hover:text-secondary transition-colors"
          >
            ABOUT
          </Link>

          {/* Language — secondary chrome, dimmed at rest */}
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); toggleLocale(); }}
              className="px-3 h-9 border border-primary font-data-mono text-data-mono flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-background"
            >
              {locale.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Hamburguesa (mobile): abre popup con language, index, about */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-primary hover:text-secondary transition-colors"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Navigation Drawer (mobile only) */}
      <nav
        className={`md:hidden fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-gutter text-primary"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Language */}
        <div className="mb-4 opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); toggleLocale(); }}
            className="px-4 h-12 border border-primary font-data-mono text-data-mono flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-background"
          >
            {locale.toUpperCase()}
          </button>
        </div>

        {/* Separator */}
        <div className="w-16 border-t border-outline-variant opacity-30" />

        {/* Work */}
        <Link
          href="/work"
          className="font-headline-md text-headline-md tracking-[0.2em] text-primary hover:text-secondary transition-all duration-300 uppercase mt-8"
          onClick={() => setMenuOpen(false)}
        >
          WORK
        </Link>

        {/* Separator */}
        <div className="w-16 border-t border-outline-variant opacity-30 mt-8" />

        {/* About */}
        <Link
          href="/about"
          className="font-headline-md text-headline-md tracking-[0.2em] text-primary hover:text-secondary transition-all duration-300 uppercase mt-8"
          onClick={() => setMenuOpen(false)}
        >
          ABOUT
        </Link>
      </nav>
    </>
  );
}
