"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollRef, useAppStore } from "@/lib/store";
import { detectLowPower } from "@/lib/useLowPower";

gsap.registerPlugin(ScrollTrigger);

/**
 * Live Lenis instance. Anything that wants to scroll the page programmatically
 * must go through this — `scrollIntoView()` fights Lenis and stutters.
 */
export const lenisRef = { current: null };

export function scrollToId(id, offset = -40) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisRef.current) lenisRef.current.scrollTo(el, { offset, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/**
 * Lenis + GSAP ScrollTrigger, wired together as ONE source of truth.
 *
 * The important bits:
 *  - Lenis drives the window scroll; ScrollTrigger is told to update from it,
 *    otherwise triggers fire against the native (lagging) scroll position.
 *  - GSAP's ticker runs Lenis' RAF, so there is a single animation loop for the
 *    whole DOM layer (R3F keeps its own loop for the canvas).
 *  - `scrollRef.current` is a plain mutable 0→1 number the 3D scene samples in
 *    useFrame. No React state, no re-renders.
 *
 * Lenis itself lives for the whole session (one effect, mounted once), but the
 * section triggers are rebuilt per route — see the second effect.
 */
export default function SmoothScroll({ children }) {
  const setSection = useAppStore((s) => s.setSection);
  const pathname = usePathname();

  useEffect(() => {
    const reduced = detectLowPower();

    const lenis = new Lenis({
      duration: reduced ? 0.6 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native momentum on touch feels better than a JS-smoothed version.
      syncTouch: false,
    });
    lenisRef.current = lenis;

    const onScroll = ({ scroll, limit }) => {
      scrollRef.current = limit > 0 ? scroll / limit : 0;
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /**
   * Per-route setup. Client navigation swaps the whole section list out from
   * under GSAP, so without this the triggers stay bound to elements that are no
   * longer in the document, the new page gets none at all, and `scrollRef`
   * keeps reporting the old page's progress to the 3D scene.
   */
  useEffect(() => {
    // Land at the top of the new route. Lenis owns the scroll position, so
    // resetting the window alone would leave the two disagreeing.
    lenisRef.current?.scrollTo(0, { immediate: true });
    scrollRef.current = 0;
    setSection(0);

    // Highlight the nav item for whichever section owns the viewport centre.
    const sections = gsap.utils.toArray("[data-section]");
    const triggers = sections.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: ({ isActive }) => isActive && setSection(i),
      })
    );

    ScrollTrigger.refresh();

    return () => triggers.forEach((t) => t.kill());
  }, [pathname, setSection]);

  return children;
}
