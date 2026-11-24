"use client";

import { siteConfig } from "@/data/config";
import type { PhotoItem } from "@/types";
import { useState } from "react";
import { useParams } from "next/navigation";
import { EditorialLayout } from "@/components/EditorialLayout";
import { EditorialLightbox } from "@/components/EditorialLightbox";

export function SerieView() {
  const params = useParams();
  const [openFn, setOpenFn] = useState<string | null>(null);

  const serieSlug = params.serie as string;

  const serie = siteConfig.series.find((s) => s.serie_slug === serieSlug);
  if (!serie) return <div className="p-8 text-on-surface-variant">Serie not found</div>;

  const photoFns = serie.images
    .filter((i) => i.type === "photo")
    .map((i) => (i as PhotoItem).data.filename);

  return (
    <div className="min-h-screen">
      <EditorialLayout serie={serie} onOpen={setOpenFn} />
      {openFn !== null && (
        <EditorialLightbox
          serie={serie}
          filenames={photoFns}
          initialFilename={openFn}
          onClose={() => setOpenFn(null)}
        />
      )}
    </div>
  );
}
