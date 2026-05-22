import Link from "next/link";
import { siteConfig as config } from "@/data/config";
import type { Serie } from "@/types";

const workSeries = config.series.filter((s) => s.category_slug !== "projects");

export default function SeriesPage() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-gutter">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-widest text-primary mb-16">
          Series
        </h1>

        <div className="space-y-12">
          {workSeries.map((serie) => (
            <SerieRow key={serie.serie_slug} serie={serie} />
          ))}
        </div>
      </div>
    </main>
  );
}

function SerieRow({ serie }: { serie: Serie }) {
  const firstImage = serie.images[0];
  const imagePath = firstImage
    ? `/images/${serie.serie_slug}/${firstImage.filename}`
    : null;

  return (
    <Link
      href={`/${serie.category_slug}/${serie.serie_slug}`}
      className="group flex items-center gap-8 border-b border-outline-variant/30 pb-8 hover:opacity-80 transition-opacity"
    >
      {imagePath && (
        <div className="w-24 h-24 shrink-0 bg-surface overflow-hidden">
          <img
            src={imagePath}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div>
        <h2 className="font-headline-md text-headline-md tracking-[0.2em] uppercase text-primary group-hover:text-secondary transition-colors">
          {serie.serie_name}
        </h2>
        <p className="font-data-mono text-data-mono text-secondary mt-1">
          {serie.year}
        </p>
      </div>
    </Link>
  );
}