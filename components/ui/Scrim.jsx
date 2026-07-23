"use client";

import { useEffect, useRef } from "react";
import { scrollRef } from "@/lib/store";

/**
 * Dark wash between the WebGL layer (z-index 1) and the DOM sections (z-index
 * 10), fading in as the hero scrolls away.
 *
 * Without it, body copy sits directly on a lit CRT and is unreadable no matter
 * where the camera goes. Per-section gradients were not enough — the scene is
 * bright and moves, so the only reliable answer is to knock the whole 3D layer
 * back once it stops being the subject. The hero keeps it at 0 so the machine
 * is seen at full strength exactly when it matters.
 *
 * `max` is per-route because "stops being the subject" is not true everywhere.
 * On the landing page the CRT has said its piece by the time you reach About.
 * On /music the deck keeps performing the whole way down — the camera goes
 * top-down over the record at scroll 0.66 and the tonearm cues to whichever
 * track you picked — so the default 0.82 would hide the payoff. See the call
 * site in app/music/page.jsx.
 *
 * @param max  opacity the wash settles at, 0–1
 */
const START = 0.03;
const END = 0.14;

export default function Scrim({ max = 0.82 }) {
  const el = useRef(null);

  useEffect(() => {
    let raf;
    let last = -1;
    const tick = () => {
      const p = (scrollRef.current - START) / (END - START);
      const o = Math.max(0, Math.min(1, p)) * max;
      if (el.current && o !== last) {
        last = o;
        el.current.style.opacity = o;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [max]);

  return (
    <div
      ref={el}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        background: "var(--bg)",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
