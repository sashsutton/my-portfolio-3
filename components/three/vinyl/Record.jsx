"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVinylTextures } from "./useVinylTextures";
import { RECORD_R } from "./disc";

/*
 * TODO — swap for a real model: public/models/vinyl.glb (Draco).
 * The disc itself is genuinely better as procedural geometry though; what a
 * scanned model would buy you is the sleeve and the wear. If you do swap it,
 * keep it sized to RECORD_R in disc.js — Tonearm.jsx solves against it.
 */

export { RECORD_R };
const THICKNESS = 0.016;

/**
 * The record. Spin is driven from the parent (Turntable); this component owns
 * the disc's own materials and its warp.
 *
 * Real pressings are never perfectly flat, and the tell is that the edge rises
 * and falls once per revolution rather than wobbling at some unrelated rate.
 * So the tilt is phase-locked to `spin` — one cycle per turn — which is what
 * makes it read as a warped record instead of a shaking prop.
 */
export default function Record({ spin = 0, warp = 0.004 }) {
  const group = useRef(null);
  const textures = useVinylTextures();

  // CylinderGeometry emits three groups: [side, top, bottom]. Giving it an
  // array of materials lets the grooved face differ from the edge and the back
  // without a second mesh.
  const materials = useMemo(() => {
    const edge = new THREE.MeshPhysicalMaterial({
      color: "#0b0b0c",
      roughness: 0.55,
      metalness: 0,
      clearcoat: 0.4,
    });

    const face = new THREE.MeshPhysicalMaterial({
      color: "#101011",
      // three MULTIPLIES this scalar by the roughness map's green channel, so
      // it has to stay at 1 and let the map own the value. Any lower and the
      // product turns the disc into a mirror, which picks up the whole warm
      // environment and reads as tan plastic instead of black vinyl.
      roughness: 1,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
      // Dialled back from 1. The scene's Environment is a bright studio rig,
      // and at full strength its reflection sits on top of the black albedo and
      // turns the whole disc mid-grey. Low enough to stay black, high enough to
      // still catch the softbox strips as they sweep past.
      envMapIntensity: 0.55,
    });
    if (textures) {
      face.map = textures.colorTex;
      face.roughnessMap = textures.roughTex;
    }

    const back = face.clone();
    return [edge, face, back];
  }, [textures]);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = spin;
    // One warp cycle per revolution, on two axes 90° apart so the high point
    // travels around the rim instead of see-sawing on one axis.
    group.current.rotation.x = Math.sin(spin) * warp;
    group.current.rotation.z = Math.cos(spin) * warp;
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow material={materials}>
        <cylinderGeometry args={[RECORD_R, RECORD_R, THICKNESS, 128, 1]} />
      </mesh>
    </group>
  );
}
