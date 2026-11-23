"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Splash() {
  // Solo la primera vez por sesión (sessionStorage) o si llega ?no-splash
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("no-splash") || sessionStorage.getItem("splash_seen")) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem("splash_seen", "1");
    timerRef.current = setTimeout(() => setVisible(false), 2500);
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
            <p className="font-data-mono text-data-mono font-headline-lg-mobile text-headline-lg-mobile leading-relaxed text-white tracking-[0.15em]">
              Pablo Tutino
            </p>
            <p className="font-data-mono text-data-mono font-headline-lg-mobile text-headline-lg-mobile mt-5 tracking-[0.25em] text-white uppercase">
              Visual storyteller &amp; photographer
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}