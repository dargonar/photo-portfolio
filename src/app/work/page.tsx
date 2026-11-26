"use client";

import WorkGrid from "@/components/WorkGrid";
import { useI18n } from "@/hooks/useI18n";

// Work: todas las series y proyectos juntos — la diferencia se verá en credits/descripción.
export default function WorkPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mb-8">
        <h1 className="font-pt-mono text-[12px] tracking-[0.2em] NOTuppercase text-on-surface-variant">
          {t("Work", "Obras")}
        </h1>
      </div>
      <WorkGrid />
    </div>
  );
}
