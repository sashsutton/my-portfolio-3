"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import VinylScene from "./VinylScene";
import Effects from "./Effects";
import AssetProgress from "./AssetProgress";
import { useLowPower } from "@/lib/useLowPower";

/**
 * Fixed WebGL layer for /music. Mirrors SceneCanvas, but antialiasing is ON
 * here: the platter rim and the tonearm are thin specular edges against a dark
 * background, and the CRT page's grainy no-AA look just reads as aliasing on
 * them. There is no full-screen emissive surface on this page to hide it.
 */
export default function VinylCanvas() {
  const lowPower = useLowPower();

  return (
    <>
      <AssetProgress />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <Canvas
          style={{ pointerEvents: "auto" }}
          dpr={lowPower ? [1, 1] : [1, 1.5]}
          shadows={!lowPower}
          gl={{
            antialias: !lowPower,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{ position: [0, 2.4, 5.9], fov: 38, near: 0.1, far: 60 }}
        >
          <Suspense fallback={null}>
            <VinylScene />
            <Effects />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
