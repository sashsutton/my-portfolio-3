"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Monitor from "./Monitor";
import Keyboard from "./Keyboard";
import { useAppStore } from "@/lib/store";

/**
 * The hero centrepiece: monitor + keyboard.
 *
 * The machine deliberately does NOT track the cursor. Scroll is the only thing
 * that moves the view — CameraRig owns that — so the framing stays exactly
 * where the visitor last put it and reading the screen never fights a swivel
 * that follows the mouse.
 *
 * What remains is a slow idle breath: a fraction of a degree of yaw and pitch
 * on a long sine, plus a millimetre of vertical drift. It is there so a still
 * frame does not read as a static image, and it is small enough that you
 * notice its absence rather than its presence.
 */
export default function RetroComputer({ position = [0, 0, 0] }) {
  const group = useRef(null);
  const screenGlow = useRef(null);
  const lowPower = useAppStore((s) => s.lowPower);
  const entered = useAppStore((s) => s.entered);

  const [booted, setBooted] = useState(false);

  // The tube warms up a beat after the loading screen is dismissed — the pause
  // is what sells it as a machine powering on rather than a page rendering.
  useEffect(() => {
    if (!entered) return;
    const id = setTimeout(() => setBooted(true), 420);
    return () => clearTimeout(id);
  }, [entered]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    const targetYaw = Math.sin(t * 0.32) * 0.012;
    const targetPitch = Math.sin(t * 0.24) * 0.008;

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetYaw, 3.2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetPitch, 3.2, delta);
    // Barely-there breathing on the vertical axis.
    group.current.position.y = position[1] + Math.sin(t * 0.6) * 0.012;

    // The screen's spill light pulses with the boot and then settles.
    if (screenGlow.current) {
      const want = booted ? 0.9 + Math.sin(t * 7.3) * 0.06 : 0;
      screenGlow.current.intensity = THREE.MathUtils.damp(
        screenGlow.current.intensity,
        want,
        2.4,
        delta
      );
    }
  });

  return (
    <group ref={group} position={position}>
      <Monitor booted={booted} />

      {/* Keyboard sits in front of the stand, angled toward the viewer. */}
      <Keyboard position={[0.05, -1.915, 2.05]} rotation={[0, -0.05, 0]} />

      {/* Green spill from the tube onto the bezel and desk. This is what makes
          the CRT read as the light source rather than a lit surface. */}
      <pointLight
        ref={screenGlow}
        color="#7cffb2"
        intensity={0}
        distance={4.5}
        decay={2}
        position={[0, 0.1, 1.9]}
        castShadow={!lowPower}
        shadow-mapSize={[512, 512]}
      />
    </group>
  );
}
