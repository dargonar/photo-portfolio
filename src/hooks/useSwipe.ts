"use client";

import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SWIPE_THRESHOLD = 50; // px
const SWIPE_VERTICAL_RATIO = 2; // horizontal must be 2x vertical to count

export function useSwipe(handlers: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Horizontal swipe (must be clearly horizontal)
      if (absDx > SWIPE_THRESHOLD && absDx > absDy * SWIPE_VERTICAL_RATIO) {
        if (dx > 0) handlers.onSwipeRight?.();
        else handlers.onSwipeLeft?.();
        return;
      }

      // Vertical swipe
      if (absDy > SWIPE_THRESHOLD && absDy > absDx * SWIPE_VERTICAL_RATIO) {
        if (dy > 0) handlers.onSwipeDown?.();
        else handlers.onSwipeUp?.();
      }
    },
    [handlers]
  );

  return {
    onTouchStart,
    onTouchEnd,
  };
}