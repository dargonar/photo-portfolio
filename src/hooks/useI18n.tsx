"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Locale } from "@/types";

interface I18nContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (en: string, es: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "es",
  toggleLocale: () => {},
  t: (en, es) => es,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "en" || stored === "es") {
      setLocale(stored);
    } else {
      const navLang = navigator.language?.toLowerCase() || "";
      setLocale(navLang.startsWith("es") ? "es" : "en");
    }
  }, []);

  const toggleLocale = () => {
    setLocale((prev) => {
      const next = prev === "en" ? "es" : "en";
      localStorage.setItem("locale", next);
      return next;
    });
  };

  const t = (en: string, es: string) => (locale === "en" ? en : es);

  return (
    <I18nContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
