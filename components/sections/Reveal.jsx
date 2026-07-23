"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./sections.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade/rise a block in as it enters the viewport.
 *
 * Uses ScrollTrigger rather than IntersectionObserver so it shares Lenis'
 * scroll position — an IO would fire against the native scroll and land a frame
 * or two out of sync with the camera move.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 22,
  as: Tag = "div",
  className = "",
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, [delay, y]);

  return (
    <Tag ref={ref} className={`${styles.reveal} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
