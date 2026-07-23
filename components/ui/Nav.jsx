"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/components/providers/LanguageProvider";
import { scrollToId } from "@/components/providers/SmoothScroll";
import { scrollRef, useAppStore } from "@/lib/store";
import { shared } from "@/lib/content";
import styles from "./ui.module.css";

const ITEMS = [
  { id: "about", key: "about" },
  { id: "work", key: "work" },
  { id: "next", key: "next" },
  { id: "contact", key: "contact" },
];

/**
 * @param variant "home" shows the section links and highlights the active one;
 *                "page" shows a back link instead, for routes that aren't the
 *                landing page and therefore have no sections to jump to.
 */
export default function Nav({ variant = "home" }) {
  const { t, lang, setLang } = useLang();
  const section = useAppStore((s) => s.section);
  const rail = useRef(null);

  // Progress rail, written straight to the transform each frame.
  useEffect(() => {
    let raf;
    const tick = () => {
      if (rail.current) rail.current.style.transform = `scaleX(${scrollRef.current})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div className={styles.rail} aria-hidden>
        <div ref={rail} className={styles.railFill} />
      </div>

      <header className={styles.nav}>
        {variant === "home" ? (
          <a
            href="#top"
            className={styles.brand}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("top", 0);
            }}
          >
            sasha<span className={styles.brandDot}>.</span>sutton
          </a>
        ) : (
          <Link href="/" className={`${styles.brand} ${styles.back}`}>
            ← sasha<span className={styles.brandDot}>.</span>sutton
          </Link>
        )}

        {variant === "home" && (
          <nav className={styles.navLinks}>
            {ITEMS.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${styles.navLink} ${section === i + 1 ? styles.navLinkActive : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(item.id);
                }}
              >
                {t.nav[item.key]}
              </a>
            ))}
          </nav>
        )}

        <div className={styles.navRight}>
          <div className={styles.lang} role="group" aria-label="Language">
            {["en", "fr"].map((code) => (
              <button
                key={code}
                className={`${styles.langBtn} ${lang === code ? styles.langOn : ""}`}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <a className={styles.cvBtn} href={shared.links.cv} download>
            {t.nav.cv} ↓
          </a>
        </div>
      </header>
    </>
  );
}
