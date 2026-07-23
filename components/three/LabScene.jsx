"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";
import PointField from "./lab/PointField";
import CameraRig from "./CameraRig";
import { useAppStore } from "@/lib/store";

/**
 * The /science scene. One point cloud in a void — no lights, because nothing
 * here is lit: the points are emissive sprites and the edges are additive
 * lines, which is what lets the bloom pass turn them into phosphor.
 *
 * Camera arc: the shell head-on → off to the side as it clusters → alongside
 * the helix → up and over the loss surface → back out. Each pose is chosen for
 * the formation that is on screen at that scroll position, so these must stay
 * in step with STOPS in lab/formations.js.
 */
const KEYFRAMES = [
  { at: 0.0, pos: [0, 0.5, 7.4], look: [0, 0, 0] },
  { at: 0.25, pos: [-3.6, 1.7, 5.6], look: [0, 0, 0] },
  { at: 0.52, pos: [3.2, 0.3, 5.0], look: [0, 0.1, 0] },
  { at: 0.75, pos: [0.4, 4.4, 5.6], look: [0, -0.5, 0] },
  { at: 1.0, pos: [-1.8, 1.1, 8.2], look: [0, 0, 0] },
];

/** The widest formation is the loss surface at ~6 units across. */
const FIT = { landscape: 6.4, portrait: 4.6, subjectZ: 0, baseZ: 7.4 };

/** Pointer parallax, in radians. Small on purpose — the scroll choreography is
 *  doing the work, this only stops the cloud feeling like a rendered still. */
const TILT = 0.09;

export default function LabScene({ count }) {
  const lowPower = useAppStore((s) => s.lowPower);
  const group = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.1);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * TILT,
      2,
      d
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * TILT * 0.6,
      2,
      d
    );
  });

  return (
    <>
      <color attach="background" args={["#06070a"]} />

      <group ref={group}>
        <PointField count={count} />
      </group>

      <CameraRig keyframes={KEYFRAMES} fit={FIT} damping={1.8} />

      {!lowPower && <AdaptiveDpr pixelated />}
      <Preload all />
    </>
  );
}
