# Sasha Sutton — portfolio

An interactive 3D/retro portfolio. The landing page is a beige CRT computer that
boots up, watches your cursor, and lists the three pillars as programs on its
screen; scrolling flies the camera back through About / What I do / What I want
to do / Contact.

Built on **Next.js (App Router)** rather than Vite, per the follow-up request.
Everything else is as specified: React Three Fiber + drei + postprocessing,
Lenis for smooth scroll, GSAP ScrollTrigger for scroll choreography.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| 3D | three 0.185, @react-three/fiber 9, @react-three/drei 10 |
| Post FX | @react-three/postprocessing (bloom, chromatic aberration, noise, vignette) |
| Scroll | Lenis + GSAP ScrollTrigger |
| State | zustand, plus one plain mutable ref for per-frame scroll |
| i18n | EN/FR via `LanguageProvider`; all copy lives in `lib/content.js` |

## Layout

```
app/
  layout.jsx            fonts, providers, the global grain + scanline veil
  page.jsx              landing page; the canvas is dynamically imported
  globals.css           design tokens + shared primitives
components/
  providers/
    SmoothScroll.jsx    Lenis <-> ScrollTrigger wiring, scrollToId()
    LanguageProvider.jsx
  three/
    SceneCanvas.jsx     the <Canvas>: DPR, shadows, tone mapping
    HeroScene.jsx       lights, Environment, desk, contact shadows
    CameraRig.jsx       scroll -> camera keyframes, damped
    Effects.jsx         post-processing stack (skipped on low power)
    AssetProgress.jsx   reports three's loader progress to the store
    useLabelTexture.js  canvas-texture text for the moulded plastic labels
    retro/
      RetroComputer.jsx assembles the machine; cursor tracking + idle motion
      Monitor.jsx       shell, bezel, tube housing, glass, chin furniture
      CRTScreen.jsx     the phosphor shader (scanlines, flicker, roll, boot)
      ScreenUI.jsx      the DOM terminal projected onto the screen
      Keyboard.jsx      instanced keycaps
      Desk.jsx          procedural woodgrain surface
  sections/             the scrolling DOM half of the page
  ui/                   Loader, Nav, Scrim
lib/
  content.js            ALL copy, EN + FR
  store.js              zustand store + `scrollRef`
  useLowPower.js        low-power detection
```

## Things worth knowing before you iterate

**The CRT is two layers, on purpose.** `CRTScreen` is a shader plane that emits
light (so Bloom has something physical to smear); `ScreenUI` is real DOM
projected onto it by drei's `<Html transform>`. That split keeps the type
vector-crisp and genuinely clickable while the glow stays part of the scene.

**Screen geometry is a tight depth ladder.** See the `Z` constants at the top of
`Monitor.jsx`. The layers sit ~0.1 units apart and the order is load-bearing.

**The terminal has two authoring sizes.** 640x480 normally, 380x285 below 820px
wide or in portrait (`FULL` / `COMPACT` in `ScreenUI.jsx`). The screen occupies a
roughly fixed number of *device* pixels, so authoring at 640 on a phone renders
15px type at ~8px. Authoring smaller makes type bigger — at the cost of fitting
less text, which is why `content.js` carries a shorter `bootCompact`.

**Animate shader uniforms through the material ref**, not through the object you
passed to the `uniforms` prop — they are not guaranteed to be the same object,
and if they aren't, every per-frame write silently does nothing.

**Avoid `abs()` and `fract()` in anything that scales the phosphor's brightness.**
Both introduce discontinuities that rasterise as razor-thin bright lines across
the tube, which Bloom and chromatic aberration then amplify into obvious defects.

## Performance

- three/drei/postprocessing are code-split into a client-only chunk; first load
  JS for `/` is ~161 kB and the DOM content paints before the canvas arrives.
- No asset downloads at all right now: the machine is primitives, the desk and
  the plastic labels are procedural canvas textures, and the Environment is
  built from drei `<Lightformer>`s rather than an HDRI.
- DPR is capped at 1.5 (1.0 on low power); `<AdaptiveDpr>` drops it further if
  the frame budget is blown.
- Low-power devices (`lib/useLowPower.js`: reduced-motion, <=4 cores, <=4 GB, or
  a coarse pointer on a narrow screen) skip post-processing and shadows, and get
  a smaller Environment and static contact shadows.

## Swapping in your own assets

Everything is primitives with `TODO` comments marking the seams.

1. **Models** — put Draco-compressed GLBs in `public/models/` and the Draco
   decoder in `public/draco/`. `Monitor.jsx` and `Keyboard.jsx` each carry a
   `TODO` showing the `useGLTF(url, "/draco/")` call to drop in. Keep
   `<CRTScreen>` and `<ScreenUI>` positioned on the model's screen plane — they
   are deliberately decoupled from the shell geometry. Free sources: Poly Pizza
   (CC-BY) and Sketchfab filtered to CC0.
2. **HDRI** — drop a 1K `.hdr` in `public/hdri/` and swap the `<Environment>` in
   `HeroScene.jsx` for `<Environment files="/hdri/….hdr" resolution={256} />`.
   Keep it <=1K; at this exposure nothing higher is visible.
3. **Textures** — 2K ceiling, and prefer `.ktx2` over `.png` for anything large.
4. **CV** — save your PDF at `public/cv/sasha-sutton-cv.pdf` (see the README in
   that folder). The header and Contact buttons already point there.

## Not built yet

The **vinyl / music page** (`/music`) — spinning record driven by scroll velocity
with inertia, tonearm, HTML track overlays, play/pause, HDRI reflections.
`shared.programs` in `lib/content.js` already carries the `/music` href for when
it lands; today `MUSIC.EXE` scrolls to the Music & Sound block on the landing
page instead.
