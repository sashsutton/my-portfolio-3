"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import LabScene from "./LabScene";
import Effects from "./Effects";
import AssetProgress from "./AssetProgress";
import { detectLowPower, useLowPower } from "@/lib/useLowPower";

/**
 * Fixed WebGL layer for /science.
 *
 * Antialiasing is off here, unlike /music: there is not a straight specular edge
 * in the scene. Everything is a round additive sprite or a 1px additive line, so
 * MSAA has nothing to bite on and would only cost fill rate — which is the exact
 * resource this scene is short of, given how much of the frame is overdrawn by
 * transparent points.
 */
export default function LabCanvas() {
  useLowPower();

  /**
   * Read the heuristic *synchronously* rather than through the store. The point
   * count sizes the GPU buffers at mount, and the store's value is still false
   * on first render (it is set from an effect), so a phone would allocate the
   * full-fat cloud and only then be told it is a phone. This module is loaded
   * with ssr:false, so touching the DOM here is safe.
   */
  const count = useMemo(() => (detectLowPower() ? 650 : 1500), []);

  return (
    <>
      <AssetProgress />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <Canvas
          style={{ pointerEvents: "auto" }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{ position: [0, 0.5, 7.4], fov: 40, near: 0.1, far: 60 }}
        >
          <Suspense fallback={null}>
            <LabScene count={count} />
            <Effects />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
