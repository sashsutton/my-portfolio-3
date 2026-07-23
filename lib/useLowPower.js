"use client";

import { useEffect } from "react";
import { useAppStore } from "./store";

/**
 * Heuristic for "this device should not run bloom + chromatic aberration at 2x DPR".
 *
 * There is no reliable GPU-tier API in the browser, so we combine the cheap
 * signals that are actually available. Anything that trips a signal falls back
 * to the simplified scene (see SceneCanvas / Effects).
 */
export function detectLowPower() {
  if (typeof window === "undefined") return false;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 720;
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
  const lowMemory = (navigator.deviceMemory || 8) <= 4;

  // Phones get the simple path by default; a coarse pointer on a big screen
  // (touch laptop, tablet) only counts if the hardware also looks weak.
  return reducedMotion || fewCores || lowMemory || (coarse && narrow);
}

export function useLowPower() {
  const lowPower = useAppStore((s) => s.lowPower);
  const setLowPower = useAppStore((s) => s.setLowPower);

  useEffect(() => {
    setLowPower(detectLowPower());
  }, [setLowPower]);

  return lowPower;
}
