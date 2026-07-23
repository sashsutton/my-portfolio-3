"use client";

import { useMemo } from "react";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";

/**
 * The "it looks like a photograph of a CRT" pass.
 *
 * Order matters: bloom first (it needs the raw HDR values from the emissive
 * screen), then the lens artefacts, then vignette last so it sits on top of
 * everything like real film would.
 *
 * There is deliberately no Noise pass here. `.grain` in globals.css already
 * lays animated film grain over the *entire* page — canvas included, at
 * z-index 41 — so a grain pass in the composer was a second full-screen pass
 * computing something the viewer was already seeing. The CSS version also
 * covers the DOM sections, which the composer never could.
 *
 * Skipped wholesale in low-power mode — a phone GPU spends more on these
 * passes than on the entire scene.
 */
export default function Effects() {
  const lowPower = useAppStore((s) => s.lowPower);
  const caOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0006), []);

  if (lowPower) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* mipmapBlur gets the wide, soft falloff from the mip chain, which is
          where the LARGE kernel's extra taps were going. MEDIUM costs less and
          the two are hard to tell apart once the grain lands on top. */}
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.45}
        kernelSize={KernelSize.MEDIUM}
        mipmapBlur
      />
      <ChromaticAberration
        offset={caOffset}
        radialModulation
        modulationOffset={0.35}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
    </EffectComposer>
  );
}
