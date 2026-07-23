"use client";

import { Environment, Lightformer, ContactShadows, AdaptiveDpr, Preload } from "@react-three/drei";
import Turntable from "./vinyl/Turntable";
import CameraRig from "./CameraRig";
import { useAppStore } from "@/lib/store";

/**
 * The /music scene: one turntable, lit like a photo shoot.
 *
 * Camera arc: 3/4 view of the deck → in close over the tonearm → nearly
 * top-down on the record (the angle everybody actually pictures) → back out.
 */
const KEYFRAMES = [
  { at: 0.0, pos: [0.0, 2.4, 5.9], look: [0, 0.1, 0] },
  { at: 0.34, pos: [-2.9, 2.9, 3.8], look: [-0.1, 0.05, 0.1] },
  { at: 0.66, pos: [0.35, 6.2, 1.0], look: [0, 0.05, 0] },
  { at: 1.0, pos: [2.2, 3.4, 6.4], look: [0.1, 0.1, 0] },
];

/** The deck is ~4.4 wide; portrait frames the record instead. */
const FIT = { landscape: 5.6, portrait: 3.6, subjectZ: 0, baseZ: 5.9 };

export default function VinylScene() {
  const lowPower = useAppStore((s) => s.lowPower);

  return (
    <>
      <color attach="background" args={["#08090b"]} />
      {/* Without fog the 40-unit floor runs to the horizon and fills the top of
          the frame with flat grey. Fogging it to the background colour puts the
          deck in a void instead. */}
      <fog attach="fog" args={["#08090b", 7, 19]} />

      {/* No ambient term on purpose. The fill comes from the Environment rig
          below, which is directional — a flat ambient would wash out the
          softbox streaks that are the only reason the disc reads as vinyl. */}

      {/* Key light, high and slightly behind — rakes across the grooves. */}
      <directionalLight
        position={[-3.5, 6, 2.5]}
        intensity={1.5}
        color="#e6eefc"
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0012}
      />
      {/* Warm rim from the opposite side, so the platter's edge separates. */}
      <directionalLight position={[4, 2, -4]} intensity={0.35} color="#ffb454" />

      {/*
       * The reflections are the whole point on this page, so the Environment is
       * built as an actual softbox rig rather than a generic room: long, thin
       * strips. A glossy black disc reflects a strip as a hard-edged streak
       * sweeping around as it turns, which is exactly what reads as "vinyl" —
       * a uniform HDRI just makes it evenly grey.
       *
       * TODO: for a real photographic look, drop a 1K studio .hdr into
       * public/hdri/ and swap this for
       *   <Environment files="/hdri/studio-1k.hdr" resolution={256} />
       * Keep the strips if you do — layer them over the file with `frames={1}`.
       */}
      <Environment resolution={lowPower ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={5} color="#ffffff" scale={[0.6, 9, 1]} position={[-4, 4, 2]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3.2} color="#dbe6ff" scale={[0.4, 8, 1]} position={[4.5, 3.5, -1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#ffcf9a" scale={[7, 0.4, 1]} position={[0, 2.5, -5]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.9} color="#7cffb2" scale={2.2} position={[2.5, 1.2, 4]} target={[0, 0, 0]} />
        {/* Broad soft top fill — stops the black plinth crushing to nothing. */}
        <Lightformer form="rect" intensity={0.4} color="#ffffff" scale={[12, 12, 1]} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>

      <Turntable />

      {/* Floor, well below the deck — catches the shadow, otherwise unseen. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0d0e11" roughness={0.9} metalness={0.05} />
      </mesh>

      <ContactShadows
        position={[0, -0.43, 0]}
        scale={11}
        blur={2.4}
        opacity={0.6}
        far={3}
        resolution={lowPower ? 256 : 512}
        color="#000000"
        frames={lowPower ? 1 : Infinity}
      />

      <CameraRig keyframes={KEYFRAMES} fit={FIT} damping={2.0} />

      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  );
}
