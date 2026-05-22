"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAME = "Pablo Tutino";
const TAGLINE = "Visual storyteller & photographer";

function useTypewriter(text: string, durationMs: number) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const chars = text.split("");
    const interval = durationMs / chars.length;
    let i = 0;
    setDisplay("");
    setDone(false);

    const t = setInterval(() => {
      i++;
      setDisplay(chars.slice(0, i).join(""));
      if (i >= chars.length) {
        clearInterval(t);
        setDone(true);
      }
    }, interval);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { display, done };
}

export function Splash() {
  const [visible, setVisible] = useState(true);
  const name = useTypewriter(NAME, 1100);
  const tagline = useTypewriter(TAGLINE, 900);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(false), 4200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={dismiss}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer"
        >
          <div className="text-center px-6">
            <p className="font-data-mono text-data-mono text-[clamp(1rem,3vw,1.75rem)] leading-relaxed text-white uppercase tracking-[0.15em] min-h-[1.2em]">
              {name.display}
              {name.done && <span className="animate-pulse">|</span>}
            </p>
            <p className="font-data-mono text-data-mono text-[clamp(0.65rem,1.5vw,0.9rem)] text-[#888] mt-5 tracking-[0.25em] uppercase min-h-[1.2em]">
              {tagline.display}
              {tagline.done && name.done && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}