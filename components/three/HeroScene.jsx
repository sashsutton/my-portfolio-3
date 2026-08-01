"use client";

import { Environment, Lightformer, ContactShadows, AdaptiveDpr, Preload } from "@react-three/drei";
import RetroComputer from "./retro/RetroComputer";
import Desk from "./retro/Desk";
import CameraRig from "./CameraRig";
import { useAppStore } from "@/lib/store";

/**
 * The dominant constraint after the hero is legibility, not cinematography: the
 * DOM copy owns the frame from About onward, so the camera's job is to retreat
 * until the machine is atmosphere rather than subject. Every keyframe past the
 * hero pulls further back, and the fog (near 9, far 26) swallows it.
 */
const KEYFRAMES = [
  // hero — square on to the tube, filling the frame
  { at: 0.0, pos: [0.0, 0.15, 7.4], look: [0, 0.1, 0] },
  // about — rise, swing right, and back off hard
  { at: 0.18, pos: [2.8, 1.3, 10.2], look: [0.5, -0.5, 0] },
  // what I do — cross to the other side, further still
  { at: 0.45, pos: [-3.8, 2.2, 12.4], look: [-0.6, -1.0, 0] },
  // what's next — lift away
  { at: 0.72, pos: [2.6, 3.4, 14.2], look: [0, -1.5, 0] },
  // contact — the machine left alone on the desk, nearly lost in the fog
  { at: 1.0, pos: [0.0, 4.8, 17.0], look: [0, -1.9, 0] },
];

/**
 * Portrait framing width. This has to clear the *shell* (3.34 wide), not just
 * the screen (2.56): framing tight to the screen crops the beige sides off, so
 * the tube looks like it is bursting out of the machine rather than mounted in
 * it. 3.3 shows the whole computer — both side bezels and the rounded corners —
 * with the screen clearly seated inside it. The cost is a slightly smaller
 * on-screen terminal, which is why the copy has its own shorter `introCompact`.
 */
const FIT = { landscape: 5, portrait: 3.3, subjectZ: 1.21, baseZ: 7.4 };

/**
 * Everything inside the hero Canvas except post-processing.
 *
 * The lighting is a dim, warm room at night with one practical (the tube). The
 * Environment is built from Lightformers rather than an HDRI file: it costs no
 * download, renders once to a small cube target, and gives the beige plastic
 * and the curved glass something believable to reflect.
 *
 * TODO — for a richer look, drop a 1K/2K .hdr in public/hdri/ and swap to:
 *   <Environment files="/hdri/studio-1k.hdr" resolution={256} />
 * Keep it ≤1K; at this exposure nothing higher is visible.
 */
export default function HeroScene() {
  const lowPower = useAppStore((s) => s.lowPower);

  return (
    <>
      <color attach="background" args={["#07080a"]} />
      <fog attach="fog" args={["#07080a", 9, 26]} />

      {/* Just enough ambient to keep the shadow side from going pure black. */}
      <ambientLight intensity={0.55} color="#aab6c4" />

      {/* Cool moonlight through a window, camera-left. This is what keeps the
          plastic reading as beige rather than as "whatever the screen is
          shining on it" — it has to out-punch the green spill by a wide margin. */}
      <directionalLight
        position={[-6, 5, 4]}
        intensity={1.7}
        color="#b6cde4"
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0015}
      />

      {/* Warm bounce from behind the desk, so the beige doesn't go grey. */}
      <directionalLight position={[5, 1.5, -6]} intensity={0.75} color="#ffc98a" />

      {/* Reflections only — kept low-key. A strong green lightformer here reads
          as "the whole room is green" rather than "the tube is glowing". */}
      <Environment resolution={lowPower ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#9fc0e8" scale={[10, 6, 1]} position={[-6, 5, 3]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.0} color="#ffcf9a" scale={[8, 4, 1]} position={[6, 2, -5]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.5} color="#7cffb2" scale={3} position={[0, 0.2, 5]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" scale={[14, 14, 1]} position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>

      <Desk y={-2.0} />

      {/* Soft grounding under the machine. Cheaper and softer than a real
          shadow map at this scale, so it runs even on the low-power path. */}
      <ContactShadows
        position={[0, -1.985, 0.6]}
        scale={13}
        blur={2.6}
        opacity={0.55}
        far={4}
        resolution={lowPower ? 256 : 512}
        color="#000000"
        frames={lowPower ? 1 : Infinity}
      />

      <RetroComputer position={[0, 0, 0]} />

      <CameraRig keyframes={KEYFRAMES} fit={FIT} />

      {/* Drop resolution automatically if the frame budget is blown. */}
      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  );
}
