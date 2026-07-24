# Sasha Sutton — portfolio

An interactive, WebGL-first portfolio in three scenes. Everything 3D is generated
at runtime — there are no model files, no HDRIs, no scanned textures.

- **`/`** — a beige CRT computer that boots to a `whoami`, lists two programs on
  its phosphor screen, and flies the camera back through About / What I do /
  What's next / Contact as you scroll.
- **`/music`** — a turntable you spin by scrolling; a SoundCloud DJ set wired to
  the platter (play the track, the record turns) and an embedded video.
- **`/science`** — a point cloud that reorganises as you scroll — shell →
  clusters → helix → loss surface — behind the research, projects and education.

Built on **Next.js (App Router)** with React Three Fiber, Lenis for smooth
scroll, and GSAP ScrollTrigger for the scroll choreography. Everything is
bilingual (EN/FR); all copy lives in one file.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| 3D | three 0.185, @react-three/fiber 9, @react-three/drei 10 |
| Post FX | @react-three/postprocessing — bloom, chromatic aberration, vignette |
| Scroll | Lenis + GSAP ScrollTrigger (one source of truth) |
| State | zustand, plus plain mutable refs for per-frame values |
| i18n | EN/FR via `LanguageProvider`; **all** copy in `lib/content.js` |

Film grain and scanlines are a full-page CSS veil (`app/globals.css`), not a
post-processing pass — it covers the DOM as well as the canvas, for free.

## Layout

```
app/
  layout.jsx              fonts, providers, the global grain + scanline veil
  page.jsx                landing page (CRT); canvas dynamically imported
  music/page.jsx          the turntable page
  science/page.jsx        the point-cloud page
  globals.css             design tokens + shared primitives
components/
  providers/
    SmoothScroll.jsx      Lenis <-> ScrollTrigger wiring, scrollToId()
    LanguageProvider.jsx  EN/FR context
  three/
    SceneCanvas.jsx       landing <Canvas>
    HeroScene.jsx         landing lights, Environment, desk, contact shadows
    CameraRig.jsx         scroll -> camera keyframes, damped (shared by all pages)
    Effects.jsx           post-processing stack (skipped on low power)
    AssetProgress.jsx     reports three's loader progress to the store
    retro/                the CRT computer (Monitor, CRTScreen, ScreenUI, …)
    vinyl/                the turntable (Turntable, Tonearm, Record, disc.js)
    lab/                  the point cloud (PointField, formations.js)
    VinylCanvas/Scene     /music canvas + scene
    LabCanvas/Scene       /science canvas + scene
  sections/               the scrolling DOM half of each page + CSS modules
  ui/                     Loader, Nav, Scrim, useTypewriter
lib/
  content.js              ALL copy, EN + FR, plus non-localised data (links, media)
  store.js                zustand store + mutable refs (scroll, SoundCloud widget)
  useLowPower.js          low-power detection
```

## The three scenes

**Landing (`/`).** The CRT is two layers on purpose: `CRTScreen` is a shader
plane that *emits* light (so Bloom has something physical to smear), and
`ScreenUI` is real DOM projected onto it by drei's `<Html transform>` — which
keeps the terminal type vector-crisp and genuinely clickable. The machine does
not track the cursor; scroll is the only thing that moves the view.

**Music (`/music`).** `Turntable.jsx` damps *velocity*, not angle, so the platter
keeps coasting after you stop scrolling and takes a moment to wind up — that
inertia is what sells it. `Tonearm.jsx` is solved, not posed: pick the groove
radius, solve for the pivot angle (see the derivation at the top of the file).
The SoundCloud embed is bound to the platter through the SoundCloud Widget API —
its play/pause events drive the same `playing` flag that spins the vinyl, and the
floating deck button drives the widget back.

**Science (`/science`).** `PointField.jsx` morphs a few thousand points between
formations entirely on the GPU: `aFrom`/`aTo` stay put and only a `uMix` uniform
moves, so a transition costs one uniform write per frame, not N vector ops. The
points and the graph edges share the same buffers, so they can never disagree.
`formations.js` builds every shape from a seeded PRNG — identical on every reload.

## Things worth knowing before you iterate

**Screen geometry is a tight depth ladder.** See the `Z` constants at the top of
`Monitor.jsx`; the layers sit ~0.1 units apart and the order is load-bearing.

**The terminal has two authoring sizes.** 640×480 normally, 380×285 below 820px
wide or in portrait (`FULL` / `COMPACT` in `ScreenUI.jsx`). The screen occupies a
roughly fixed number of *device* pixels, so authoring at 640 on a phone renders
15px type at ~8px. Authoring smaller makes type bigger — at the cost of fitting
less text, which is why `content.js` carries a shorter `introCompact`. That
compact box has a fixed height; its line count is load-bearing (see the comment
on `.compact .boot` in `screen.module.css`).

**Animate shader uniforms through the material ref**, not the object you passed
to the `uniforms` prop — they are not guaranteed to be the same object, and if
they aren't, every per-frame write silently does nothing.

**Avoid `abs()` and `fract()` in anything scaling the phosphor's brightness.**
Both introduce discontinuities that rasterise as razor-thin bright lines, which
Bloom and chromatic aberration then amplify into obvious defects.

## Editing content

`lib/content.js` is the single source of truth for every string, in EN and FR.
The two locale trees are mirrored exactly — add a key to one, add it to the
other, or it renders blank in that language. Non-localised data (links, the
SoundCloud/YouTube media, the project and education lists) lives in `shared`.

Search the file for `CHECK:` and `TODO:` — those mark the handful of things that
still want a human eye (e.g. education year ranges).

## Performance

- three/drei/postprocessing are code-split into client-only chunks; the DOM
  paints before the canvas arrives.
- No 3D asset downloads: the machine is primitives, textures are procedural
  canvas draws, and every Environment is drei `<Lightformer>`s, not an HDRI.
- DPR is capped at 1.5 (1.0 on low power); `<AdaptiveDpr>` drops it further if the
  frame budget is blown.
- The YouTube embed and the portrait are lazy (load only when scrolled near).
  The SoundCloud embed loads eagerly on `/music` — it has to, so its widget can
  bind to the deck before you reach it; only the player UI loads, not the audio.
- Low-power devices (`lib/useLowPower.js`: reduced-motion, ≤4 cores, ≤4 GB, or a
  coarse pointer on a narrow screen) skip post-processing and shadows, get a
  smaller Environment, static contact shadows, and a smaller point cloud.

## Assets

- **Portrait** — `public/portrait.jpg`, referenced from `shared.portrait`
  (`lib/content.js`). Shoot/crop 4:5; `next/image` handles resizing.
- **CV** — `public/cv/sasha-sutton-cv.pdf`; the nav and Contact buttons link to it.
- **Audio** — large sets are *not* self-hosted. `public/audio/*.mp3` is
  gitignored (a full set is huge and usually contains other artists' work); host
  those on SoundCloud/Mixcloud and embed. A short track of your own can go in with
  `git add -f`.

## Notes

- `node_modules` and `.next` are gitignored — never commit either.
- The site is deployed from GitHub, so anything a page needs at runtime must be in
  the repo (or streamed from an external host); a file only on disk won't ship.
