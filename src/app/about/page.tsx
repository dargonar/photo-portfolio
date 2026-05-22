"use client";

import Image from "next/image";
import { siteConfig as config } from "@/data/config";
import { useI18n } from "@/hooks/useI18n";

export default function AboutPage() {
  const about = config.pages.about;
  const { t } = useI18n();
  const bio = t(about.content_text, about.content_text_es);

  return (
    <div className="min-h-screen px-gutter md:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-20">
        {/* Left: Name + portrait */}
        <div className="md:w-1/2 flex flex-col">
          <h1 className="font-label-sm text-label-sm tracking-[0.2em] uppercase text-on-surface-variant mb-8">
            {about.title}
          </h1>
          <div className="relative aspect-[3/4] bg-white/5 mt-auto overflow-hidden">
            <Image
              src="/images/portrait.png"
              alt="Pablo Tutino"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Right: Bio */}
        <div className="md:w-1/2 flex items-start pt-4 md:pt-40">
          <div className="space-y-6">
            <div
              className="font-body-md text-body-md leading-relaxed text-on-surface-variant [&_b]:text-primary [&_b]:font-normal"
              dangerouslySetInnerHTML={{ __html: bio }}
            />
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://www.instagram.com/pablotutino"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://github.com/dargonar"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
