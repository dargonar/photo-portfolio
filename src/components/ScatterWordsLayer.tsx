"use client";

import type { ScatterWord } from "@/types";

/**
 * Renders a set of ScatterWord[] as absolute-positioned elements inside a
 * position:relative container.  Each word is placed at (x%, y%) with
 * optional rotation and CSS class.
 */
export function ScatterWordsLayer({ words }: { words: ScatterWord[] }) {
  if (!words?.length) return null;

  return (
    <>
      {words.map((w, i) => (
        <div
          key={i}
          className={`absolute pointer-events-none whitespace-nowrap z-[5] ${w.class ?? "word-body"}`}
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: `translate(-50%, -50%) rotate(${w.rotate ?? 0}deg)`,
          }}
        >
          {w.text}
        </div>
      ))}
    </>
  );
}