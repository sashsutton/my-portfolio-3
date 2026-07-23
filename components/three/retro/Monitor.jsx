"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import CRTScreen from "./CRTScreen";
import ScreenUI from "./ScreenUI";
import { useLabelTexture } from "../useLabelTexture";

/*
 * TODO — swap for a real model:
 *   Drop a Draco-compressed monitor at public/models/crt-monitor.glb, then
 *
 *     const { nodes, materials } = useGLTF("/models/crt-monitor.glb", "/draco/");
 *
 *   and replace the primitive shell below with <primitive object={nodes.Shell} />.
 *   Keep <CRTScreen> and <ScreenUI> positioned on the model's screen plane —
 *   they are decoupled from this geometry on purpose. Good free sources:
 *   Poly Pizza ("CRT monitor", CC-BY) and Sketchfab's CC0 filter.
 *
 * Everything until then is built from primitives so the whole hero ships with
 * zero asset downloads.
 *
 * Layout (world units, monitor-local):
 *   shell      3.34 x 2.90 x 2.30, front face at z = +1.00
 *   opening    x ±1.28, y -0.86 → +1.06   (screen centre y = +0.10)
 *   screen     2.56 x 1.92  → exactly 4:3, matching the 640x480 DOM overlay
 */

const OPENING = { halfW: 1.28, top: 1.06, bottom: -0.86 };
const SHELL = { halfW: 1.67, halfH: 1.45 };
const SCREEN_Y = 0.1;
/** Radius of the sphere the glass is a patch of. Bigger = flatter tube. */
const GLASS_R = 20;

/*
 * Depth ladder (monitor-local z). These layers are only ~0.1 apart, so the
 * order below is load-bearing — get it wrong and the tube housing eats the
 * corners of the curved screen.
 *
 *   1.00        shell front face
 *   0.90 → 1.20 tube housing (dark surround)
 *   1.21 → 1.26 phosphor plane (flat base + outward-only bulge)
 *   1.23 → 1.30 curved glass (corners → apex)
 *   1.28        DOM terminal overlay
 *   0.99 → 1.39 bezel bars (recess the screen by protruding past it)
 *   1.40        chin furniture: badge, LED, thumbwheels
 */
const Z = {
  tubeFace: 1.05,
  phosphor: 1.21,
  glassApex: 1.3,
  screenUI: 1.28,
  bezel: 1.19,
  bezelDepth: 0.4,
  chin: 1.4,
};

/** Aged beige plastic, slightly yellowed and matte. */
function PlasticMaterial({ tone = "#d8c49a" }) {
  return <meshStandardMaterial color={tone} roughness={0.72} metalness={0.02} />;
}

/** One bar of the front bezel. Four of these frame the tube. */
function BezelBar({ args, position }) {
  return (
    <RoundedBox args={args} radius={0.045} smoothness={3} position={position} castShadow>
      <PlasticMaterial />
    </RoundedBox>
  );
}

export default function Monitor({ booted }) {
  const brand = useLabelTexture("SASHA-TRON 1200");

  const bezelZ = Z.bezel;
  const bezelD = Z.bezelDepth;

  return (
    <group>
      {/* ---------------------------------------------------------- shell --- */}
      <RoundedBox
        args={[SHELL.halfW * 2, SHELL.halfH * 2, 2.3]}
        radius={0.14}
        smoothness={4}
        position={[0, 0, -0.15]}
        castShadow
        receiveShadow
      >
        <PlasticMaterial />
      </RoundedBox>

      {/* Tapered tube housing poking out the back — reads as CRT, not LCD. */}
      <mesh position={[0, 0, -1.55]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <cylinderGeometry args={[1.15, 0.42, 0.7, 4, 1, true]} />
        <meshStandardMaterial color="#b9ad8f" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Cooling slots moulded into the top. */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, 1.451, -0.75 + i * 0.16]}>
          <boxGeometry args={[2.1, 0.02, 0.055]} />
          <meshStandardMaterial color="#3a352b" roughness={0.9} />
        </mesh>
      ))}

      {/* ------------------------------------------------------ tube face --- */}
      {/* Dark housing around the phosphor. Its back half is buried inside the
          shell; only the 1.00 → 1.20 slice is ever visible. */}
      <RoundedBox
        args={[2.62, 1.98, 0.3]}
        radius={0.1}
        smoothness={3}
        position={[0, SCREEN_Y, Z.tubeFace]}
      >
        <meshStandardMaterial color="#0a0d0c" roughness={0.4} metalness={0.1} />
      </RoundedBox>

      <CRTScreen booted={booted} position={[0, SCREEN_Y, Z.phosphor]} />
      <ScreenUI booted={booted} position={[0, SCREEN_Y, Z.screenUI]} />

      {/* Curved glass over the phosphor: picks up the Environment reflection.
          A patch of a big sphere (R = GLASS_R) gives the tube its convex bulge;
          arc length = R * angle, so the angles below carve out ~2.62 x 1.98.
          The patch's apex sits at z = +R locally, hence the -R offset. */}
      <mesh position={[0, SCREEN_Y, Z.glassApex - GLASS_R]}>
        <sphereGeometry
          args={[
            GLASS_R,
            32,
            24,
            Math.PI / 2 - 2.62 / GLASS_R / 2,
            2.62 / GLASS_R,
            Math.PI / 2 - 1.98 / GLASS_R / 2,
            1.98 / GLASS_R,
          ]}
        />
        {/* Roughness is kept well off zero: a mirror-sharp highlight on a
            surface this flat collapses to a single pixel, which chromatic
            aberration then renders as a magenta dead-pixel in the middle of
            the screen. Spreading it reads as glass instead. */}
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          roughness={0.18}
          metalness={0}
          clearcoat={0.55}
          clearcoatRoughness={0.2}
          color="#dfe9e4"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---------------------------------------------------------- bezel --- */}
      <BezelBar
        args={[SHELL.halfW * 2, SHELL.halfH - OPENING.top, bezelD]}
        position={[0, (SHELL.halfH + OPENING.top) / 2, bezelZ]}
      />
      <BezelBar
        args={[SHELL.halfW * 2, OPENING.bottom + SHELL.halfH, bezelD]}
        position={[0, (-SHELL.halfH + OPENING.bottom) / 2, bezelZ]}
      />
      <BezelBar
        args={[SHELL.halfW - OPENING.halfW, OPENING.top - OPENING.bottom, bezelD]}
        position={[-(SHELL.halfW + OPENING.halfW) / 2, SCREEN_Y, bezelZ]}
      />
      <BezelBar
        args={[SHELL.halfW - OPENING.halfW, OPENING.top - OPENING.bottom, bezelD]}
        position={[(SHELL.halfW + OPENING.halfW) / 2, SCREEN_Y, bezelZ]}
      />

      {/* ------------------------------------------------- chin furniture --- */}
      {/* Plane aspect must match the label canvas (1024x160 = 6.4) or the type
          stretches. Not toneMapped={false}: this is ink on plastic, not light. */}
      {brand && (
        <mesh position={[-0.52, -1.14, Z.chin]}>
          <planeGeometry args={[1.15, 1.15 / 6.4]} />
          <meshBasicMaterial map={brand} transparent depthWrite={false} />
        </mesh>
      )}

      {/* Power LED. Kept tone-mapped and under the Bloom threshold on purpose:
          as an unclamped emissive it becomes the brightest thing on the page
          and the composer turns it into a halo bigger than the bezel. The
          pointLight below is what actually sells it as lit. */}
      <mesh position={[1.24, -1.15, Z.chin]}>
        <circleGeometry args={[0.028, 16]} />
        <meshBasicMaterial color="#e08a2a" />
      </mesh>
      {/* Stood well off the surface deliberately. With decay=2, a point light
          0.07 units from the plastic attenuates by ~1/0.07² — the chin blows
          out to a hard-edged ring instead of a soft pool. */}
      <pointLight
        position={[1.24, -1.15, Z.chin + 0.55]}
        color="#ffb454"
        intensity={0.55}
        distance={2.2}
        decay={2}
      />

      {/* Brightness / contrast thumbwheels. */}
      {[0.72, 0.95].map((x) => (
        <mesh key={x} position={[x, -1.16, Z.chin]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.07, 20]} />
          <meshStandardMaterial color="#6f6654" roughness={0.5} metalness={0.15} />
        </mesh>
      ))}

      {/* ---------------------------------------------------------- stand --- */}
      <mesh position={[0, -1.62, -0.1]} castShadow>
        <cylinderGeometry args={[0.34, 0.5, 0.42, 24]} />
        <PlasticMaterial tone="#c1b492" />
      </mesh>
      <RoundedBox
        args={[1.95, 0.16, 1.6]}
        radius={0.06}
        smoothness={3}
        position={[0, -1.9, -0.1]}
        castShadow
        receiveShadow
      >
        <PlasticMaterial tone="#c1b492" />
      </RoundedBox>
    </group>
  );
}
