"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/LanguageProvider";
import { shared } from "@/lib/content";
import Reveal from "./Reveal";
import styles from "./science.module.css";
import sections from "./sections.module.css";

/**
 * Anything absolute leaves the site, so it opens in its own tab and never
 * goes through next/link — Link would try to navigate the current page to it,
 * which loses the visitor's place on this one.
 */
const isExternal = (href) => /^https?:\/\//.test(href);

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

export function ScienceHero() {
  const { t } = useLang();
  return (
    <section id="top" data-section className={styles.hero}>
      <div>
        <h1 className={styles.heroTitle}>{t.science.title}</h1>
        <p className={styles.heroLead}>{t.science.lead}</p>
        <div className={`mono ${styles.heroRow}`}>
          <span>{t.science.hint}</span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- research -- */

export function Research() {
  const { t } = useLang();
  const { research } = t.science;

  return (
    <section id="research" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={research.title} />

        {shared.research.publications.map((pub, i) => {
          const copy = research.entries[pub.id];
          return (
            <Reveal key={pub.id} delay={i * 0.06} className={styles.paper}>
              <p className={`mono ${styles.paperMeta}`}>{copy.meta}</p>
              <h3 className={styles.paperTitle}>{copy.title}</h3>
              <p className={styles.paperBlurb}>{copy.blurb}</p>
              <div className={styles.paperLinks}>
                <a
                  className={`mono ${styles.paperLink} ${styles.paperLinkPrimary}`}
                  href={pub.hal}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {research.hal} ↗
                </a>
                <a
                  className={`mono ${styles.paperLink}`}
                  href={pub.scholar}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {research.scholar} ↗
                </a>
                {pub.repo && (
                  <a
                    className={`mono ${styles.paperLink}`}
                    href={pub.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {research.repo} ↗
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- projects -- */

export function Projects() {
  const { t } = useLang();
  const { projects } = t.science;

  return (
    <section id="projects" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={projects.title} />

        <div className={styles.projects}>
          {shared.research.projects.map((project, i) => {
            const copy = projects.entries[project.id];
            return (
              <Reveal key={project.id} delay={i * 0.06} className={styles.project}>
                <div className={styles.projectHead}>
                  <span className={`mono ${styles.projectNo}`}>{project.no}</span>
                  <span className={`mono ${styles.projectYear}`}>{project.year}</span>
                </div>

                <h3 className={styles.projectTitle}>{copy.title}</h3>
                <p className={styles.projectBlurb}>{copy.blurb}</p>

                <div className={styles.stack}>
                  {project.stack.map((item) => (
                    <span key={item} className={`mono ${styles.stackItem}`}>
                      {item}
                    </span>
                  ))}
                </div>

                {/* Links are optional: a project with neither a repo nor a demo
                    simply renders without the row, rather than with dead chrome. */}
                {(project.repo || project.demo) && (
                  <div className={styles.projectLinks}>
                    {project.repo && (
                      <a
                        className={`mono ${styles.projectLink}`}
                        href={project.repo}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {projects.repo} ↗
                      </a>
                    )}
                    {project.demo &&
                      (isExternal(project.demo) ? (
                        <a
                          className={`mono ${styles.projectLink}`}
                          href={project.demo}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {projects.demo} ↗
                        </a>
                      ) : (
                        <Link className={`mono ${styles.projectLink}`} href={project.demo}>
                          {projects.demo} →
                        </Link>
                      ))}
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

/* ------------------------------------------------------------ education -- */

export function Education() {
  const { t } = useLang();
  const { education } = t.science;

  return (
    <section id="education" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={education.title} />

        <ol className={styles.timeline}>
          {shared.research.education.map((item, i) => {
            const copy = education.entries[item.id];
            return (
              <Reveal as="li" key={item.id} delay={i * 0.06} className={styles.timelineItem}>
                <div className={styles.when}>
                  <span className={`mono ${styles.years}`}>
                    {item.from}
                    <span className={styles.yearsDash}>—</span>
                    {item.to}
                  </span>
                  <span className={`mono ${styles.eduLocation}`}>{copy.location}</span>
                </div>
                <div>
                  <h3 className={styles.eduPlace}>
                    {/* Links out to the official programme page. Falls back to
                        plain text if an entry has no url, so adding one later is
                        a content change only. */}
                    {item.url ? (
                      <a
                        className={styles.eduLink}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {copy.place}
                        <span className={styles.eduLinkMark} aria-hidden>
                          ↗
                        </span>
                      </a>
                    ) : (
                      copy.place
                    )}
                  </h3>
                  <p className={styles.eduProgramme}>{copy.programme}</p>
                  {copy.detail && <p className={styles.eduDetail}>{copy.detail}</p>}
                  {copy.coursework && (
                    <p className={styles.eduCourse}>
                      <span className={`mono ${styles.eduCourseLabel}`}>
                        {education.coursework}
                      </span>
                      {copy.coursework}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- focus -- */

export function Focus() {
  const { t } = useLang();
  const { focus } = t.science;

  return (
    <section id="focus" data-section className="section">
      <div className={styles.block}>
        <SectionHead title={focus.title} />
        <ul className={sections.numbered}>
          {shared.research.focus.map((id, i) => (
            <Reveal as="li" key={id} delay={i * 0.06} className={sections.numberedItem}>
              <span className={`mono ${sections.numberedIndex}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.focusTitle}>{focus.entries[id].title}</h3>
                <p className="body-copy" style={{ margin: 0 }}>
                  {focus.entries[id].body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- outro -- */

export function ScienceOutro() {
  const { t } = useLang();
  const { outro } = t.science;

  return (
    <section id="outro" data-section className={`section ${styles.outro}`}>
      <div className={styles.block}>
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
