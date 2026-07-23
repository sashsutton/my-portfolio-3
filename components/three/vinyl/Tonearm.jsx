"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * S-arm tonearm, solved rather than posed.
 *
 * A tonearm pivots at a fixed post, so the stylus traces an arc — the arm's
 * angle and the groove radius it lands on are not independent. Animating the
 * angle directly and eyeballing it means the needle drifts off the record as
 * soon as anything else moves, so instead we go the other way: pick the groove
 * radius we want, then solve for the angle that puts the stylus there.
 *
 * With pivot P (in the XZ plane), arm length L, and stylus direction
 * u = (cos θ, sin θ), the stylus sits at P + L·u, so
 *
 *     r² = |P|² + L² + 2·L·|P|·cos(θ − α)      where α = atan2(P.z, P.x)
 *
 * Solving for θ gives `angleForRadius` below. The mesh models the tube along
 * local +X, and a Y-rotation of `a` maps +X to (cos a, 0, −sin a), hence the
 * negation when the angle is applied.
 */

const PIVOT = { x: 1.72, y: 0.36, z: -1.02 };
const ARM_L = 2.05;

const PIVOT_R = Math.hypot(PIVOT.x, PIVOT.z);
const ALPHA = Math.atan2(PIVOT.z, PIVOT.x);

function angleForRadius(r) {
  const k = THREE.MathUtils.clamp(
    (r * r - PIVOT_R * PIVOT_R - ARM_L * ARM_L) / (2 * ARM_L * PIVOT_R),
    -1,
    1
  );
  return ALPHA + Math.acos(k);
}

/** Parked off the edge of the record, over the arm rest. */
export const REST_RADIUS = 1.78;

/** Where the tube sits when parked — 0.2 back along the arm from the stylus. */
const REST_POST = (() => {
  const theta = angleForRadius(REST_RADIUS);
  const back = ARM_L - 0.2;
  return { x: PIVOT.x + back * Math.cos(theta), z: PIVOT.z + back * Math.sin(theta) };
})();

/**
 * @param radiusRef  mutable { current: number } holding the groove radius to
 *                   track. A ref rather than a prop because the value changes
 *                   every frame from scroll, which does not re-render.
 */
export default function Tonearm({ radiusRef, lifted = true }) {
  const arm = useRef(null);
  const current = useRef({ angle: angleForRadius(REST_RADIUS), lift: 1 });

  useFrame((state, delta) => {
    if (!arm.current) return;
    const d = Math.min(delta, 0.1);

    const targetAngle = angleForRadius(radiusRef?.current ?? REST_RADIUS);
    current.current.angle = THREE.MathUtils.damp(current.current.angle, targetAngle, 2.4, d);
    current.current.lift = THREE.MathUtils.damp(current.current.lift, lifted ? 1 : 0, 4, d);

    arm.current.rotation.y = -current.current.angle;
    // Cueing lever: the whole arm rises a few mm, and tips back very slightly.
    arm.current.position.y = PIVOT.y + current.current.lift * 0.085;
    arm.current.rotation.z = current.current.lift * 0.03;
  });

  return (
    <group>
      {/* --- fixed pivot post (does not rotate with the arm) --------------- */}
      <mesh position={[PIVOT.x, 0.13, PIVOT.z]} castShadow>
        <cylinderGeometry args={[0.15, 0.17, 0.26, 28]} />
        <meshStandardMaterial color="#25262a" roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh position={[PIVOT.x, 0.3, PIVOT.z]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.12, 20]} />
        <meshStandardMaterial color="#d7d8dc" roughness={0.22} metalness={0.95} />
      </mesh>

      {/* Anti-skate dial */}
      <mesh position={[PIVOT.x + 0.3, 0.1, PIVOT.z + 0.12]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 20]} />
        <meshStandardMaterial color="#3a3b40" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* --- the arm ------------------------------------------------------- */}
      <group ref={arm} position={[PIVOT.x, PIVOT.y, PIVOT.z]}>
        {/* gimbal yoke */}
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.13, 0.16]} />
          <meshStandardMaterial color="#c9cacf" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* counterweight, behind the pivot */}
        <mesh position={[-0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.2, 24]} />
          <meshStandardMaterial color="#1c1d20" roughness={0.32} metalness={0.8} />
        </mesh>

        {/* main tube — modelled along +X (see the note at the top) */}
        <mesh position={[ARM_L / 2 + 0.02, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.024, 0.028, ARM_L - 0.16, 20]} />
          <meshStandardMaterial color="#b9bbc2" roughness={0.22} metalness={0.95} />
        </mesh>

        {/* headshell */}
        <group position={[ARM_L - 0.06, -0.05, 0]} rotation={[0, 0, -0.18]}>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.08, 0.13]} />
            <meshStandardMaterial color="#dcdde1" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* cartridge */}
          <mesh position={[0.02, -0.08, 0]} castShadow>
            <boxGeometry args={[0.16, 0.09, 0.1]} />
            <meshStandardMaterial color="#8a2c2c" roughness={0.5} metalness={0.2} />
          </mesh>
          {/*
           * Stylus. Two things have to be said explicitly or it ends up buried
           * in the vinyl pointing the wrong way:
           *
           *  - coneGeometry's apex is at +height/2, so an unrotated cone points
           *    *up*. The z-rotation is π (flip) plus 0.18 to cancel the
           *    headshell's -0.18 tilt, leaving the needle vertical in world
           *    space, apex down.
           *  - the y is solved, not eyeballed. With lift = 0 the apex must land
           *    on the record face at y = 0.128:
           *      apex = PIVOT.y + hs.y + (x·sin(-0.18) + y·cos(-0.18)) - h/2
           *      0.128 = 0.36 - 0.05 + (0.07·sin(-0.18) + y·cos(-0.18)) - 0.03
           *    → y = -0.1418
           */}
          <mesh position={[0.07, -0.1418, 0]} rotation={[0, 0, Math.PI + 0.18]}>
            <coneGeometry args={[0.012, 0.06, 8]} />
            <meshStandardMaterial color="#e8e8ea" roughness={0.15} metalness={1} />
          </mesh>
        </group>
      </group>

      {/* --- arm rest ---------------------------------------------------- */}
      {/* Positioned by solving where the parked arm actually ends up, rather
          than by eye: the tube crosses REST_POST a little behind the stylus. */}
      <mesh position={[REST_POST.x, 0.21, REST_POST.z]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.42, 16]} />
        <meshStandardMaterial color="#25262a" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[REST_POST.x, 0.43, REST_POST.z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 12]} />
        <meshStandardMaterial color="#3a3b40" roughness={0.6} />
      </mesh>
    </group>
  );
}
