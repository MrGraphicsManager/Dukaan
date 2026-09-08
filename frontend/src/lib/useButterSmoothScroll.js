import { useEffect } from "react";

/**
 * Butter-smooth momentum scroll engine (Native Lenis-style Lerp)
 * Provides silky, continuous momentum scrolling for desktop mousewheel and trackpads
 * with zero external dependencies and 60fps hardware acceleration.
 */
export default function useButterSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Check if device supports touch (mobile/tablet uses native momentum scrolling)
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && window.innerWidth < 1024) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let currentY = window.pageYOffset;
    let targetY = window.pageYOffset;
    let isRunning = false;
    const damping = 0.085; // Optimal butter-smooth easing factor

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const onWheel = (e) => {
      // Don't intercept if modifier keys (Ctrl/Cmd zoom) are pressed
      if (e.ctrlKey || e.metaKey) return;

      // Don't intercept if scrolling inside an internal scrollable element (like modal or receipt list)
      let el = e.target;
      while (el && el !== document.body) {
        if (el.scrollHeight > el.clientHeight) {
          const style = window.getComputedStyle(el);
          if (style.overflowY === "auto" || style.overflowY === "scroll") {
            return;
          }
        }
        el = el.parentElement;
      }

      e.preventDefault();

      // Normalize delta across browsers
      const delta = e.deltaY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      targetY = Math.max(0, Math.min(targetY + delta, maxScroll));

      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      currentY = lerp(currentY, targetY, damping);

      // Snap when close enough to stop RAF
      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, Math.round(currentY));
        isRunning = false;
        return;
      }

      window.scrollTo(0, Math.round(currentY));
      requestAnimationFrame(updateScroll);
    };

    // Keep target synchronized if user jumps or uses keyboard scroll
    const onNativeScroll = () => {
      if (!isRunning) {
        currentY = window.pageYOffset;
        targetY = window.pageYOffset;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      isRunning = false;
    };
  }, [enabled]);
}
