import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";

const ptMono = localFont({
  src: "../../public/fonts/PTMono-Regular.ttf",
  variable: "--font-pt-mono",
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
    <html lang="es" className={ptMono.variable}>
      <body className="bg-black text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
