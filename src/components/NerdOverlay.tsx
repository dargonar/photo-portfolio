"use client";

import type { ImageData } from "@/types";

interface NerdOverlayProps {
  image: ImageData;
}

export function NerdOverlay({ image }: NerdOverlayProps) {
  return (
    <div className="nerd-overlay absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md p-4 border-t border-terminal-green/30">
      <div className="font-pt-mono text-[11px] text-terminal-green leading-[1.6] tracking-[0.02em]">
        {/* Line 1: Date + Location */}
        <div className="mb-1">{image.exif_date} — {image.location}</div>
        {/* Line 2: Camera settings */}
        <div>ISO {image.iso} · f/{image.aperture_f} · {image.shutter_speed} · {image.focal_mm}mm{image.flash && " · ⚡ Flash"}</div>
        {/* Line 3: Editor — muted */}
        {image.editor && (
          <div className="mt-1 text-on-surface-variant opacity-50 text-[9px]">{image.editor}</div>
        )}
      </div>
      <style>{`
        .nerd-overlay {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        /* Desktop: show on group hover */
        @media (min-width: 768px) {
          .group:hover .nerd-overlay {
            opacity: 1;
            pointer-events: auto;
          }
        }
        /* Mobile: always show */
        @media (max-width: 767px) {
          .nerd-overlay {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `}</style>
    </div>
  );
}
