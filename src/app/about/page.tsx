"use client";

import { siteConfig as config } from "@/data/config";

export default function AboutPage() {
  const about = config.pages.about;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-20">
        {/* Left: Name + portrait */}
        <div className="md:w-1/2 flex flex-col">
          <h1 className="font-pt-mono text-6xl md:text-8xl lg:text-9xl tracking-wider mb-8 leading-none">
            {about.title}
          </h1>
          <div className="relative aspect-[3/4] bg-white/5 mt-auto overflow-hidden">
            {/* Portrait placeholder — replace with real image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-pt-mono text-2xl text-white/15">PORTRAIT</p>
            </div>
          </div>
        </div>

        {/* Right: Bio */}
        <div className="md:w-1/2 flex items-start pt-4 md:pt-40">
          <div className="space-y-6">
            <p className="font-sans text-base md:text-lg leading-relaxed text-white/70">
              {about.content_text}
            </p>
            <a
              href="https://www.instagram.com/pablotutino"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-pt-mono text-lg tracking-wider hover:text-gray-300 transition-colors"
            >
              → Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
