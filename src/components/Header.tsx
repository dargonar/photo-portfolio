"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/hooks/useI18n";
import { useNerdMode } from "@/hooks/useNerdMode";

export function Header() {
  const { locale, toggleLocale } = useI18n();
  const { nerdMode, toggleNerdMode } = useNerdMode();

  const nerdIconSrc = "/icons/nerd-off.png";

  return (
    <header className="fixed top-0 w-full z-50 bg-glass-bg backdrop-blur-xs border-b border-outline-variant flex justify-between items-center px-gutter p-4">
      <Link
        href="/?no-splash"
        className="font-headline-lg-mobile text-headline-lg-mobile tracking-widest text-primary"
      >
        Pablo Tutino
      </Link>

      {/* Navegación inline: de izq a der INDEX, ABOUT, nerd-mode, language */}
      <div className="flex items-center gap-6">
        <Link
          href="/index"
          className="font-label-sm text-label-sm tracking-[0.2em] uppercase text-primary hover:text-secondary transition-colors"
        >
          INDEX
        </Link>
        <Link
          href="/about"
          className="font-label-sm text-label-sm tracking-[0.2em] uppercase text-primary hover:text-secondary transition-colors"
        >
          ABOUT
        </Link>

        {/* Controls: Nerd + Language — secondary chrome, dimmed at rest */}
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); toggleNerdMode(); }}
            className={`flex items-center justify-center w-9 h-9 border transition-all duration-300 ${
              nerdMode
                ? "border-primary bg-primary"
                : "border-primary/30 hover:border-primary"
            }`}
            title="Nerd Mode"
          >
            <Image
              src={nerdIconSrc}
              alt="Nerd Mode"
              width={20}
              height={20}
              className="transition-all duration-200"
            />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLocale(); }}
            className="px-3 h-9 border border-primary font-data-mono text-data-mono flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-background"
          >
            {locale.toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}
