"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Splash() {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(false), 4000);
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
            <p className="font-data-mono text-data-mono text-[clamp(1rem,3vw,1.75rem)] leading-relaxed text-white uppercase tracking-[0.15em]">
              Pablo Tutino
            </p>
            <p className="font-data-mono text-data-mono text-[clamp(0.65rem,1.5vw,0.9rem)] text-[#888] mt-5 tracking-[0.25em] uppercase">
              Visual storyteller &amp; photographer
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}