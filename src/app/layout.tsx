import type { Metadata } from "next";
import { PT_Mono, Kode_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const ptMono = PT_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pt-mono",
  display: "swap",
});

const kodeMono = Kode_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kode-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pablo Tutino — Photography",
  description: "Portfolio fotográfico de Pablo Tutino",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${ptMono.variable} ${kodeMono.variable}`}>
      <body className="bg-background text-on-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
