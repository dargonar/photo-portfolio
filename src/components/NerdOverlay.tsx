"use client";

import type { ImageData } from "@/types";

interface NerdOverlayProps {
  image: ImageData;
}

export function NerdOverlay({ image }: NerdOverlayProps) {
  return (
    <div className="nerd-overlay absolute inset-0 border border-green-400/60 items-end">
      <div className="w-full bg-black/70 p-2 font-pt-mono text-xs md:text-sm text-green-400 space-y-0.5">
        <p>{image.exif_date} — {image.location}</p>
        <p>
          ISO {image.iso} · f/{image.aperture_f} · {image.shutter_speed} · {image.focal_mm}mm
          {image.flash && " · ⚡ Flash"}
        </p>
        {image.editor && <p className="text-green-400/50">{image.editor}</p>}
      </div>
      <style>{`
        .nerd-overlay {
          display: none;
        }
        /* Desktop: show on group hover */
        @media (min-width: 768px) {
          .group:hover .nerd-overlay {
            display: flex;
          }
        }
        /* Mobile: always show */
        @media (max-width: 767px) {
          .nerd-overlay {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
