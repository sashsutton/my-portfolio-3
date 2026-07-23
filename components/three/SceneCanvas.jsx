"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import HeroScene from "./HeroScene";
import Effects from "./Effects";
import AssetProgress from "./AssetProgress";
import { useLowPower } from "@/lib/useLowPower";

/**
 * Fixed, full-viewport WebGL layer. The DOM sections scroll over the top of it;
 * the camera moves in response (see CameraRig), so the canvas itself never
 * scrolls.
 *
 * `pointerEvents: none` on the wrapper lets clicks fall through to the page,
 * and the CRT's HTML overlay re-enables them for itself only.
 */
export default function SceneCanvas() {
  const lowPower = useLowPower();

  return (
    <>
      <AssetProgress />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <Canvas
          style={{ pointerEvents: "auto" }}
          // Cap DPR at 1.5 even on desktop: at this amount of bloom, the extra
          // pixels of a 2x buffer buy almost nothing and cost a lot.
          dpr={lowPower ? [1, 1] : [1, 1.5]}
          shadows={!lowPower}
          gl={{
            antialias: false, // the composer's grain suits the CRT look anyway
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{ position: [0, 0.15, 7.4], fov: 38, near: 0.1, far: 60 }}
        >
          <Suspense fallback={null}>
            <HeroScene />
            <Effects />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
