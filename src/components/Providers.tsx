"use client";

import { I18nProvider } from "@/hooks/useI18n";
import { NerdModeProvider } from "@/hooks/useNerdMode";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NerdModeProvider>
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </NerdModeProvider>
    </I18nProvider>
  );
}
