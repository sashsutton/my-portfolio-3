"use client";

import { create } from "zustand";

/**
 * Tiny global store shared between the DOM layer and the R3F scene.
 *
 * Scroll progress deliberately lives on a *mutable ref object* rather than in
 * zustand state: ScrollTrigger updates it every frame and we don't want a React
 * re-render per frame. `useFrame` reads `scrollRef.current` directly.
 */
export const scrollRef = { current: 0 };

export const useAppStore = create((set) => ({
  /** Asset loading finished + the user has dismissed the loading screen. */
  entered: false,
  setEntered: (entered) => set({ entered }),

  /**
   * Asset-loading state, mirrored out of the lazily-loaded 3D chunk.
   *
   * The loading screen must not import from @react-three/* — doing so would
   * drag three.js into the initial bundle and defeat the whole point of
   * code-splitting the canvas. So the chunk reports *in* to here instead.
   */
  chunkReady: false,
  loadingAssets: false,
  assetProgress: 0,
  reportLoading: (patch) => set(patch),

  /** Reduced-fidelity mode: no post-processing, lower DPR, no HDRI. */
  lowPower: false,
  setLowPower: (lowPower) => set({ lowPower }),

  /** Which program tile on the CRT is hovered, or null. */
  hoveredProgram: null,
  setHoveredProgram: (hoveredProgram) => set({ hoveredProgram }),

  /** Section index currently under the camera — drives the nav highlight. */
  section: 0,
  setSection: (section) => set({ section }),

  /* ------------------------------------------------------------- /music --- */

  /** Platter running under its own power (vs. only being spun by scroll). */
  playing: false,
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),

  /** Index into shared.tracks — which band the tonearm is cued to. */
  trackIndex: 0,
  setTrackIndex: (trackIndex) => set({ trackIndex }),

}));
