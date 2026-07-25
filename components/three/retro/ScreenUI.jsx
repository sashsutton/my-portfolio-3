"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLang } from "@/components/providers/LanguageProvider";
import { useTypewriter } from "@/components/ui/useTypewriter";
import { scrollToId } from "@/components/providers/SmoothScroll";
import { scrollRef, useAppStore } from "@/lib/store";
import { shared } from "@/lib/content";
import styles from "./screen.module.css";

/**
 * The readable half of the CRT: a real DOM terminal projected onto the screen
 * plane by <Html transform>.
 *
 * Why DOM instead of drawing into the 3D scene:
 *  - type stays vector-crisp at any zoom, and inherits the site's real fonts
 *  - the program list is genuinely focusable/clickable/keyboard-navigable
 *  - the typing effect is trivial to drive from React state
 * The 3D CRTScreen behind it supplies the glow that Bloom can act on.
 *
 * The DOM is authored at a fixed pixel size and mapped onto the 2.56 x 1.92
 * screen plane (drei transform mode: worldUnits = px * distanceFactor / 400).
 *
 * That authoring size is the whole legibility story on phones. The screen
 * occupies a roughly fixed number of *device* pixels, so authoring at 640 wide
 * means every DOM pixel renders at ~0.58 device px and 15px type comes out at
 * ~8px — unreadable. Authoring at 380 instead makes it near 1:1. The trade is
 * that less text fits, hence the separate, shorter `introCompact` copy.
 */
const FULL = { w: 640, h: 480, df: 1.6 };
/**
 * Deliberately inset within the 2.56 x 1.92 tube opening. At w:380 the box maps
 * to the full opening and sits flush against the curved glass — on phones that
 * pushes the corners and the bottom scroll hint onto the bezel, so the terminal
 * reads as spilling *outside* the screen. We keep the full-size distanceFactor
 * (so type stays ~1:1 with device pixels) and shrink the authoring box instead:
 * that insets the whole terminal ~7% on every side without shrinking the text.
 */
const COMPACT = { w: 352, h: 264, df: (400 * 2.56) / 380 };

export default function ScreenUI({ booted, position }) {
  const { t } = useLang();
  const router = useRouter();
  const viewportWidth = useThree((s) => s.size.width);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const compact = viewportWidth < 820 || aspect < 1;
  const box = compact ? COMPACT : FULL;
  const hovered = useAppStore((s) => s.hoveredProgram);
  const setHovered = useAppStore((s) => s.setHoveredProgram);

  const wrapper = useRef(null);
  const [clock, setClock] = useState("--:--");

  // Boot log only starts typing once the tube has actually opened.
  const { lines, done, skip } = useTypewriter(compact ? t.introCompact : t.intro, {
    cps: 62,
    start: booted,
  });

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  /**
   * Fade the overlay out as the camera leaves the hero. <Html transform> always
   * composites above the WebGL canvas, so without this the terminal would float
   * over the About section. Written straight to style — no re-render per frame.
   */
  useFrame(() => {
    const el = wrapper.current;
    if (!el) return;
    const o = 1 - Math.min(1, Math.max(0, (scrollRef.current - 0.04) / 0.06));
    if (el._o !== o) {
      el._o = o;
      el.style.opacity = o;
      el.style.pointerEvents = o < 0.4 ? "none" : "auto";
    }
  });

  const activeBlurb = hovered ? t.programs[hovered].blurb : "";

  return (
    <Html
      transform
      distanceFactor={box.df}
      position={position}
      zIndexRange={[12, 0]}
      // Let clicks through everywhere except the terminal box itself.
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={wrapper}
        className={`${styles.screen} ${compact ? styles.compact : ""}`}
        style={{ width: box.w, height: box.h, pointerEvents: "auto" }}
        onClick={() => !done && skip()}
      >
        <div className={styles.status}>
          <span>SASHA-OS</span>
          {!compact && <span className={styles.dim}>{shared.name.toUpperCase()}</span>}
          <span>
            {clock} <i className={styles.led} />
          </span>
        </div>

        <div className={styles.boot} aria-live="polite">
          {lines.map((line, i) => (
            <span key={i} className={styles.bootLine}>
              {line}
              {i === lines.length - 1 && !done && <i className={styles.caret} />}
            </span>
          ))}
        </div>

        <div className={`${styles.menu} ${done ? styles.menuVisible : ""}`}>
          <div className={styles.menuLabel}>{t.hero.pick}</div>

          {shared.programs.map((p) => (
            <button
              key={p.id}
              className={`${styles.item} ${p.accent === "amber" ? styles.itemAmber : ""}`}
              onPointerEnter={() => {
                setHovered(p.id);
                // <Html> content isn't a <Link>, so nothing prefetches the
                // route for us — warm it on hover instead.
                if (p.href) router.prefetch(p.href);
              }}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(p.id)}
              onBlur={() => setHovered(null)}
              // Programs with a page of their own navigate; the rest scroll to
              // their block on this page.
              onClick={() => (p.href ? router.push(p.href) : scrollToId(`lens-${p.id}`))}
            >
              <span className={styles.arrow}>▸</span>
              <span className={styles.file}>{p.file}</span>
              {!compact && <span className={styles.name}>{t.programs[p.id].label}</span>}
            </button>
          ))}

          <div className={styles.blurb}>{activeBlurb}</div>
        </div>

        <div className={styles.foot}>
          <span className={styles.scrollHint}>
            <span className={styles.chevron}>▼</span>
            {t.hero.hint}
          </span>
        </div>
      </div>
    </Html>
  );
}
