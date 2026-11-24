"use client";

import { usePathname } from "next/navigation";
import { I18nProvider } from "@/hooks/useI18n";
import { NerdModeProvider } from "@/hooks/useNerdMode";
import { PasswordGateProvider } from "@/hooks/usePasswordGate";
import PasswordGate from "@/components/PasswordGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <PasswordGateProvider>
      <PasswordGate>
        <I18nProvider>
          <NerdModeProvider>
            <Header />
            <PageTransition>
              {/* Spacer por el footer fijo: en home el carousel ya gestiona su propio footer */}
              <div className={isHome ? "" : "pb-[64px]"}>{children}</div>
            </PageTransition>
            <Footer />
          </NerdModeProvider>
        </I18nProvider>
      </PasswordGate>
    </PasswordGateProvider>
  );
}
