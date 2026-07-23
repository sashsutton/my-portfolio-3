"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Record from "./Record";
import Tonearm, { REST_RADIUS } from "./Tonearm";
import { TRACK_BANDS } from "./disc";
import { scrollRef, useAppStore } from "@/lib/store";

/*
 * TODO — swap for a real model: public/models/turntable.glb (Draco).
 * If you do, keep the deck's y-stack: plinth top at y = 0, record face at
 * y ≈ 0.128. Tonearm.jsx solves against those numbers.
 */

const PLATTER_R = 1.58;

/** 33⅓ rpm in radians/second. */
const RPM_33 = ((33 + 1 / 3) / 60) * Math.PI * 2;

/**
 * Scroll velocity → extra spin. Scroll is normalised 0–1 over the whole page,
 * so a brisk flick is roughly 0.3/s; at this gain that adds ~13 rad/s.
 */
const SCROLL_GAIN = 45;
/** Lower = heavier platter, longer spin-up and spin-down. */
const INERTIA = 1.6;
/** Asymmetric: plenty of forward speed, but only a little backspin. */
const SPEED_LIMIT = { min: -42, max: 14 };

export default function Turntable() {
  const platter = useRef(null);
  const spin = useRef(0);
  const velocity = useRef(0);
  const lastScroll = useRef(0);

  /**
   * Stylus radius, updated per frame rather than per render. It depends on
   * scroll, which changes every frame and deliberately does not re-render — so
   * computing it in the render body would freeze the arm at whatever the scroll
   * position happened to be when React last ran.
   */
  const armRadius = useRef(REST_RADIUS);

  const playing = useAppStore((s) => s.playing);
  const trackIndex = useAppStore((s) => s.trackIndex);

  const band = TRACK_BANDS[trackIndex] ?? TRACK_BANDS[0];

  useFrame((state, delta) => {
    // Tab-switches and dropped frames produce huge deltas; without the clamp a
    // single one flings the platter to an absurd speed.
    const d = Math.min(delta, 0.1);

    const s = scrollRef.current;
    const scrollVelocity = (s - lastScroll.current) / Math.max(d, 1e-4);
    lastScroll.current = s;

    // Negative = clockwise seen from above, which is the way records turn.
    const desired = THREE.MathUtils.clamp(
      -((playing ? RPM_33 : 0) + scrollVelocity * SCROLL_GAIN),
      SPEED_LIMIT.min,
      SPEED_LIMIT.max
    );

    // Damping the *velocity* rather than the angle is what gives the inertia:
    // the platter keeps coasting after the scroll stops, and takes a moment to
    // wind up when it starts.
    velocity.current = THREE.MathUtils.damp(velocity.current, desired, INERTIA, d);
    spin.current += velocity.current * d;

    if (platter.current) platter.current.rotation.y = spin.current;

    // Which track, and how far through it the page has scrolled.
    const progress = THREE.MathUtils.clamp(s, 0, 1);
    armRadius.current = playing
      ? THREE.MathUtils.lerp(band.start, band.end, progress)
      : REST_RADIUS;
  });

  return (
    <group>
      {/* ---------------------------------------------------------- plinth --- */}
      <RoundedBox
        args={[4.4, 0.42, 3.4]}
        radius={0.05}
        smoothness={3}
        position={[0, -0.21, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#17181b" roughness={0.62} metalness={0.15} />
      </RoundedBox>

      {/* Brushed-metal top plate, inset slightly */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.28, 3.28]} />
        <meshStandardMaterial color="#2b2d31" roughness={0.42} metalness={0.72} />
      </mesh>

      {/* --------------------------------------------------------- platter --- */}
      <group ref={platter}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[PLATTER_R, PLATTER_R, 0.1, 96]} />
          <meshStandardMaterial color="#8f9299" roughness={0.3} metalness={0.92} />
        </mesh>

        {/* Strobe dots around the rim. They read as a moving pattern exactly
            because they're on the platter, not the deck — same as the real
            thing under a mains-frequency lamp. */}
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * (PLATTER_R - 0.035), 0.101, Math.sin(a) * (PLATTER_R - 0.035)]}
            >
              <boxGeometry args={[0.03, 0.002, 0.05]} />
              <meshBasicMaterial color="#1a1b1e" />
            </mesh>
          );
        })}

        {/* Felt slipmat */}
        <mesh position={[0, 0.106, 0]} receiveShadow>
          <cylinderGeometry args={[1.52, 1.52, 0.014, 64]} />
          <meshStandardMaterial color="#1e1f22" roughness={0.95} metalness={0} />
        </mesh>

        {/* The record rides the platter, so it inherits this group's spin —
            Record only adds its own warp on top. */}
        <group position={[0, 0.12, 0]}>
          <Record spin={0} />
        </group>
      </group>

      {/* Spindle — fixed, the record turns around it */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.24, 12]} />
        <meshStandardMaterial color="#c9cacf" roughness={0.25} metalness={0.95} />
      </mesh>

      {/* --------------------------------------------------------- tonearm --- */}
      <Tonearm radiusRef={armRadius} lifted={!playing} />

      {/* ------------------------------------------------------- furniture --- */}
      {/* Start/stop */}
      <mesh position={[-1.82, 0.02, 1.28]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 28]} />
        <meshStandardMaterial
          color={playing ? "#7cffb2" : "#3a3b40"}
          emissive={playing ? "#2f7f57" : "#000000"}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>

      {/* Pitch fader slot + slider */}
      <mesh position={[1.72, 0.012, 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 1.0]} />
        <meshStandardMaterial color="#111214" roughness={0.8} />
      </mesh>
      <mesh position={[1.72, 0.05, 1.05]} castShadow>
        <boxGeometry args={[0.22, 0.07, 0.1]} />
        <meshStandardMaterial color="#d2d3d7" roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Target light stalk, off to the back-left */}
      <mesh position={[-1.68, 0.14, -1.2]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.28, 16]} />
        <meshStandardMaterial color="#25262a" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}
