"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Terminal-style typewriter over a list of lines.
 *
 * Types through the lines joined by "\n" so line breaks cost one tick, which is
 * what makes it feel like a serial console rather than a per-line animation.
 * Newlines get an extra pause; the whole thing is driven by rAF (not
 * setInterval) so it stays in step with the rest of the page under load.
 *
 * @returns {{ lines: string[], done: boolean, skip: () => void }}
 */
export function useTypewriter(source, { cps = 55, linePause = 140, start = true } = {}) {
  const full = useMemo(() => source.join("\n"), [source]);
  const [count, setCount] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    setCount(0);
  }, [full]);

  useEffect(() => {
    if (!start) return;
    if (count >= full.length) return;

    let cancelled = false;
    let last = performance.now();
    let carry = 0;

    const step = (now) => {
      if (cancelled) return;
      const dt = (now - last) / 1000;
      last = now;
      carry += dt * cps;

      if (carry >= 1) {
        const add = Math.floor(carry);
        carry -= add;
        setCount((c) => {
          const next = Math.min(full.length, c + add);
          // Pause a beat when we land on a line break.
          if (full[next - 1] === "\n") carry -= (linePause / 1000) * cps;
          return next;
        });
      }
      raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
  }, [full, cps, linePause, start, count >= full.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = useMemo(() => full.slice(0, count).split("\n"), [full, count]);

  return {
    lines,
    done: count >= full.length,
    skip: () => setCount(full.length),
  };
}
