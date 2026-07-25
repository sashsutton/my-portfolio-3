"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/providers/LanguageProvider";
import { shared } from "@/lib/content";
import Reveal from "./Reveal";
import styles from "./sections.module.css";

/**
 * The scrolling DOM half of the landing page.
 *
 * Every section carries `data-section` so SmoothScroll can map viewport →
 * nav highlight, and an `id` so the CRT's program list and the header can
 * scroll to it through Lenis.
 */

function SectionHead({ title }) {
  return (
    <Reveal>
      <h2 className="display">{title}</h2>
      <div className="rule" />
    </Reveal>
  );
}

/* -------------------------------------------------------------------- hero */

export function Hero() {
  const { t } = useLang();
  return (
    <section id="top" data-section className={styles.hero}>
      {/* The hero's "content" is the 3D screen itself; this footer is just the
          anchor that keeps the name in the DOM for SEO and for screen readers. */}
      <div className={styles.heroFoot}>
        <div>
          <h1 className={styles.heroTitle}>{t.hero.title}</h1>
          <div className={`mono ${styles.heroTag}`}>{t.hero.tagline}</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- about */

export function About() {
  const { t } = useLang();
  return (
    <section id="about" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={t.about.title} />
        <div className={styles.grid2}>
          <Reveal>
            {/*
             * Portrait slot. The frame is drawn whether or not there is a photo
             * in it, so the empty state occupies exactly the space the real one
             * will — swapping the image in later cannot reflow the section.
             * Set shared.portrait.src to switch it on; see lib/content.js.
             */}
            <figure className={styles.portrait}>
              {shared.portrait.src ? (
                <Image
                  src={shared.portrait.src}
                  alt={t.about.portraitAlt}
                  fill
                  // The slot is capped at 300px but goes full-column once the
                  // grid collapses, so the browser needs both cases to pick a
                  // sensible file rather than always fetching the largest.
                  sizes="(max-width: 860px) 70vw, 300px"
                  className={styles.portraitImg}
                />
              ) : (
                <div className={styles.portraitEmpty} aria-hidden>
                  <span className="mono">portrait</span>
                  <span className={`mono ${styles.portraitPath}`}>public/portrait.jpg</span>
                </div>
              )}
            </figure>

            <p className="lead">{t.about.lead}</p>
            <blockquote className={styles.quote}>{t.about.quote}</blockquote>
          </Reveal>
          <Reveal delay={0.08}>
            {t.about.body.map((p, i) => (
              <p key={i} className="body-copy">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- work */

export function Work() {
  const { t } = useLang();
  return (
    <section id="work" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={t.work.title} />
        <div className={styles.lenses}>
          {t.work.lenses.map((lens, i) => {
            const program = shared.programs.find((p) => p.id === lens.key);
            const amber = program?.accent === "amber";

            const body = (
              <>
                <h3 className={styles.lensTitle}>
                  {t.programs[lens.key].label}
                  {/* Only the lenses that lead somewhere get the arrow. */}
                  {program?.href && <span className={styles.lensArrow}>→</span>}
                </h3>
                <p className={styles.lensBody}>{t.programs[lens.key].blurb}</p>
                <div className={`${styles.lensRule} ${amber ? styles.lensRuleAmber : ""}`} />
              </>
            );

            return (
              <Reveal key={lens.key} delay={i * 0.08}>
                {program?.href ? (
                  <Link id={`lens-${lens.key}`} href={program.href} className={styles.lens}>
                    {body}
                  </Link>
                ) : (
                  <div id={`lens-${lens.key}`} className={styles.lens}>
                    {body}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- next */

export function Next() {
  const { t } = useLang();
  return (
    <section id="next" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={t.next.title} />
        <ul className={styles.numbered}>
          {t.next.body.map((line, i) => (
            <Reveal as="li" key={i} delay={i * 0.06} className={styles.numberedItem}>
              <span className={`mono ${styles.numberedIndex}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="body-copy" style={{ margin: 0 }}>
                {line}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- contact */

export function Contact() {
  const { t } = useLang();
  const { links, email } = shared;

  return (
    <section id="contact" data-section className={`section ${styles.contact}`}>
      <div className={styles.block}>
        <SectionHead title={t.contact.title} />
        <Reveal>
          <p className={`serif ${styles.contactLine}`}>{t.contact.subtitle}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className={styles.ctaRow}>
            {/* Opens the PDF in its own tab rather than forcing a download:
                most people want to read a CV before deciding to keep it, and
                the browser's viewer still offers a save button. */}
            <a
              className={`${styles.cta} ${styles.ctaPrimary}`}
              href={links.cv}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t.contact.cta.cv} ↓
            </a>
            <a className={styles.cta} href={`mailto:${email}`}>
              {t.contact.cta.email} ↗
            </a>
            <a className={styles.cta} href={links.linkedin} target="_blank" rel="noreferrer noopener">
              {t.contact.cta.linkedin} ↗
            </a>
            <a className={styles.cta} href={links.github} target="_blank" rel="noreferrer noopener">
              {t.contact.cta.github} ↗
            </a>
          </div>
        </Reveal>

        <div className={`mono ${styles.footer}`}>
          <span>
            © {new Date().getFullYear()} {shared.name}
          </span>
        </div>
      </div>
    </section>
  );
}
