"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/providers/LanguageProvider";
import { useAppStore } from "@/lib/store";
import { shared } from "@/lib/content";
import styles from "./ui.module.css";

/**
 * Boot / loading screen.
 *
 * The bar has two real stages, and never runs ahead of either:
 *   0 → 35%    downloading + evaluating the three.js chunk
 *   35 → 100%  three's own loader progress (GLBs, HDRIs, textures)
 *
 * A wall-clock floor holds it back to at least MIN_MS. With today's fully
 * procedural scene there is nothing to download, so without the floor the bar
 * would flash past before anyone could read it — but the floor can only ever
 * slow the bar down, never claim progress that hasn't happened.
 *
 * Deliberately imports nothing from @react-three/*: see AssetProgress.
 */
const MIN_MS = 1500;
const CHUNK_SHARE = 35;

export default function Loader() {
  const { t } = useLang();
  const entered = useAppStore((s) => s.entered);
  const setEntered = useAppStore((s) => s.setEntered);
  const chunkReady = useAppStore((s) => s.chunkReady);
  const loadingAssets = useAppStore((s) => s.loadingAssets);
  const assetProgress = useAppStore((s) => s.assetProgress);

  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const started = useRef(0);

  useEffect(() => {
    if (!started.current) started.current = performance.now();

    let raf;
    const tick = () => {
      const real = !chunkReady
        ? CHUNK_SHARE * 0.6
        : loadingAssets
          ? CHUNK_SHARE + (assetProgress / 100) * (100 - CHUNK_SHARE)
          : 100;

      const floor = ((performance.now() - started.current) / MIN_MS) * 100;
      const next = Math.min(real, floor);

      setPct(next);
      if (next >= 100) setReady(true);
      else raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chunkReady, loadingAssets, assetProgress]);

  // "Press any key" means any key.
  useEffect(() => {
    if (!ready || entered) return;
    const enter = () => setEntered(true);
    window.addEventListener("keydown", enter, { once: true });
    return () => window.removeEventListener("keydown", enter);
  }, [ready, entered, setEntered]);

  return (
    <div className={`${styles.loader} ${entered ? styles.loaderDone : ""}`} aria-hidden={entered}>
      <div className={styles.loaderInner}>
        <div className={styles.loaderTop}>
          <span>{ready ? "SASHA-OS v1.0" : t.loader.booting}</span>
          <span className={styles.loaderPct}>{String(Math.round(pct)).padStart(3, "0")}%</span>
        </div>

        <div className={styles.bar}>
          <div className={styles.barFill} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>

        {/* Pulls the tagline from content rather than hardcoding it: this line
            sat in English even in FR, and it has to track whatever the hero
            says next to the name. */}
        <div className={styles.loaderName}>
          {shared.name} — {t.hero.tagline}
        </div>

        {ready && (
          <button className={styles.enter} onClick={() => setEntered(true)} autoFocus>
            {t.loader.ready}
          </button>
        )}
      </div>
    </div>
  );
}
