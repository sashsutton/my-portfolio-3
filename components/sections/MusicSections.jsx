"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/LanguageProvider";
import { useAppStore } from "@/lib/store";
import { shared } from "@/lib/content";
import Reveal from "./Reveal";
import styles from "./music.module.css";
import sections from "./sections.module.css";

/* --------------------------------------------------------------- shared -- */

function SectionHead({ title }) {
  return (
    <Reveal>
      <h2 className="display">{title}</h2>
      <div className="rule" />
    </Reveal>
  );
}

function Bars({ playing }) {
  return (
    <span className={`${styles.bars} ${playing ? "" : styles.barsPaused}`} aria-hidden>
      <i className={styles.bar} />
      <i className={styles.bar} />
      <i className={styles.bar} />
      <i className={styles.bar} />
    </span>
  );
}

/* ----------------------------------------------------------------- hero -- */

export function MusicHero() {
  const { t } = useLang();
  return (
    <section id="top" data-section className={styles.hero}>
      <div>
        <h1 className={styles.heroTitle}>{t.music.title}</h1>
        <p className={styles.heroLead}>{t.music.lead}</p>
        <div className={`mono ${styles.heroRow}`}>
          <span>{t.music.hint}</span>
          <span>33 ⅓ RPM · SIDE A</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ tracklist -- */

export function Tracklist() {
  const { t } = useLang();
  const playing = useAppStore((s) => s.playing);
  const trackIndex = useAppStore((s) => s.trackIndex);
  const setTrackIndex = useAppStore((s) => s.setTrackIndex);
  const setPlaying = useAppStore((s) => s.setPlaying);

  return (
    <section id="tracks" data-section className="section">
      <div className={sections.block}>
        <SectionHead title={t.music.side.title} />

        <div className={styles.tracks}>
          {shared.tracks.map((track, i) => {
            const active = i === trackIndex;
            return (
              <Reveal key={track.id} delay={i * 0.06}>
                <button
                  className={`${styles.track} ${active ? styles.trackActive : ""}`}
                  aria-pressed={active}
                  onClick={() => {
                    // Selecting a track cues the tonearm to its band and drops
                    // the needle — picking a track you can't hear start would
                    // be a dead end.
                    setTrackIndex(i);
                    setPlaying(true);
                  }}
                >
                  <span className={`mono ${styles.trackNo}`}>{track.no}</span>
                  <span className={styles.trackTitle}>
                    {track.title}
                    {active && <Bars playing={playing} />}
                  </span>
                  <span className={`mono ${styles.trackMeta}`}>{t.music.trackMeta[track.id]}</span>
                  <span className={`mono ${styles.trackLen}`}>{track.len}</span>
                </button>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <div className={`mono ${styles.embedNote}`}>{t.music.embedNote}</div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- credits -- */

export function Credits() {
  const { t } = useLang();
  const { credits } = t.music;

  return (
    <section id="credits" data-section className="section">
      <div className={sections.block}>
        <SectionHead title={credits.title} />
        <div className={styles.credits}>
          {credits.items.map((item, i) => (
            <Reveal key={item.place} delay={i * 0.06} className={styles.credit}>
              <h3 className={styles.creditPlace}>{item.place}</h3>
              <div>
                <p className={styles.creditRole}>{item.role}</p>
                <p className={`mono ${styles.creditDetail}`}>{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- outro -- */

export function MusicOutro() {
  const { t } = useLang();
  const { outro } = t.music;

  return (
    <section id="outro" data-section className={`section ${styles.outro}`}>
      <div className={sections.block}>
        <SectionHead title={outro.title} />
        <Reveal>
          <p className={styles.outroBody}>{outro.body}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <Link href="/" className={styles.backCta}>
            ← {outro.cta}
          </Link>
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

/* ------------------------------------------------------------ transport -- */

export function Transport() {
  const { t } = useLang();
  const playing = useAppStore((s) => s.playing);
  const toggle = useAppStore((s) => s.togglePlaying);
  const trackIndex = useAppStore((s) => s.trackIndex);
  const track = shared.tracks[trackIndex];

  return (
    <div className={styles.transport}>
      <div className={styles.transportMeta}>
        <span className={`mono ${styles.transportLabel}`}>
          {playing ? t.music.nowPlaying : t.music.cued}
        </span>
        <span className={`mono ${styles.transportTitle}`}>
          {track.no} · {track.title}
        </span>
      </div>

      <button
        className={styles.playBtn}
        onClick={toggle}
        aria-label={playing ? t.music.pause : t.music.play}
      >
        {playing ? (
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
            <rect x="0" y="0" width="5" height="16" rx="1" />
            <rect x="9" y="0" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
            <path d="M1 1.2c0-.9 1-1.4 1.7-.9l10 6.3c.7.4.7 1.4 0 1.8l-10 6.3c-.7.5-1.7 0-1.7-.9V1.2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
