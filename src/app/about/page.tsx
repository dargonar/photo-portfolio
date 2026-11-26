"use client";

import Image from "next/image";
import { siteConfig as config } from "@/data/config";
import { useI18n } from "@/hooks/useI18n";

export default function AboutPage() {
  const about = config.pages.about;
  const { t } = useI18n();
  const bio = t(about.content_text, about.content_text_es ?? about.content_text);

  return (
    <div className="min-h-screen px-4 py-8 pt-24 max-w-7xl mx-auto">

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-20">
        {/* Left: Name + portrait */}
        <div className="md:w-1/2 flex flex-col">
          <h1 className="XXfont-label-sm XXtext-label-sm tracking-[0.2em] text-[17px] pt-[10px] uppercase text-on-surface-variant mb-8">
            {t("ABOUT ME", "BIO")}
          </h1>
          <div className="relative aspect-[3/4] bg-white/5 overflow-hidden">
            <Image
              src="/images/portrait.jpg"
              alt="Pablo Tutino"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Right: Bio */}
        <div className="md:w-1/2 flex items-start pt-4 md:pt-15">
          <div className="space-y-6">
            <div
              className="font-body-md text-body-md leading-relaxed text-on-surface-variant [&_b]:text-primary [&_b]:font-normal"
              dangerouslySetInnerHTML={{ __html: bio }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
