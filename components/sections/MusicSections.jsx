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

/* ------------------------------------------------------------------ sets -- */

/**
 * One section, three sets — each embedded from where it actually lives:
 * a DJ set from SoundCloud, a self-hosted live set (placeholder until the file
 * exists), and the live-set video from YouTube.
 *
 * Every embed is lazy: nothing loads until it is scrolled near, so a visitor
 * who never reaches this section pays no bandwidth for any of the three.
 */
export function Sets() {
  const { t } = useLang();
  const { sets } = t.music;
  const { soundcloud, youtubeId, youtubeStart, liveSet } = shared.media;

  // youtube-nocookie so an unopened embed sets no tracking cookies. start= keeps
  // the ?t=10s from the share link; rel=0 keeps "related" to this channel only.
  const youtube = `https://www.youtube-nocookie.com/embed/${youtubeId}?start=${youtubeStart}&rel=0`;

  return (
    <section id="sets" data-section className="section">
      <div className={sections.block}>
        <SectionHead title={sets.title} />

        {/* DJ set — SoundCloud */}
        <Reveal className={styles.set}>
          <div className={`mono ${styles.setLabel}`}>{sets.dj}</div>
          <div className={styles.soundcloud}>
            <iframe
              title="SoundCloud — Sasha Sutton"
              width="100%"
              height="360"
              loading="lazy"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={soundcloudSrc(soundcloud)}
            />
          </div>
        </Reveal>

        {/* Live set — self-hosted. The frame is drawn either way, so dropping a
            file in later cannot reflow the section. */}
        <Reveal delay={0.06} className={styles.set}>
          <div className={`mono ${styles.setLabel}`}>{sets.live}</div>
          {liveSet ? (
            <audio className={styles.audio} controls preload="none" src={liveSet} />
          ) : (
            <div className={styles.audioEmpty} aria-hidden>
              <span className="mono">{sets.livePlaceholder}</span>
              <span className={`mono ${styles.audioPath}`}>public/audio/live-set.mp3</span>
            </div>
          )}
        </Reveal>

        {/* Live set — video, YouTube */}
        <Reveal delay={0.12} className={styles.set}>
          <div className={`mono ${styles.setLabel}`}>{sets.video}</div>
          <div className={styles.video}>
            <iframe
              title={sets.video}
              src={youtube}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Wraps a SoundCloud track/playlist URL in the widget player. Amber to match
 * the page's accent; visual=false is the compact bar rather than the big
 * artwork block.
 */
function soundcloudSrc(url) {
  const params = new URLSearchParams({
    url,
    color: "#ff8800",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
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

  // No track list any more, so this drives nothing but the platter — it toggles
  // the deck's constant spin. The embeds above carry the actual audio.
  return (
    <div className={styles.transport}>
      <div className={styles.transportMeta}>
        <span className={`mono ${styles.transportTitle}`}>
          {playing ? t.music.spinning : t.music.spin}
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
