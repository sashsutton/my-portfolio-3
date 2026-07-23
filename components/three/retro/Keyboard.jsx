"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

/*
 * TODO — swap for a real model: public/models/crt-keyboard.glb (Draco).
 * Until then the keycaps are one InstancedMesh: ~80 caps for a single draw
 * call, which matters far more on mobile than the geometry does.
 */

const ROWS = [
  { keys: 14, y: 0 },
  { keys: 14, y: 1 },
  { keys: 13, y: 2 },
  { keys: 12, y: 3 },
  { keys: 9, y: 4 },
];

const KEY = 0.155;
const GAP = 0.028;

export default function Keyboard(props) {
  const { count, matrices } = useMemo(() => {
    const list = [];
    const dummy = new THREE.Object3D();
    const pitch = KEY + GAP;

    ROWS.forEach(({ keys, y }, rowIndex) => {
      const rowWidth = keys * pitch;
      // Each row is nudged right a little, like a real staggered layout.
      const offset = -rowWidth / 2 + pitch / 2 + rowIndex * 0.03;
      for (let i = 0; i < keys; i++) {
        // The space bar row is one wide cap in the middle.
        dummy.position.set(offset + i * pitch, 0, -y * pitch + 0.28);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        list.push(dummy.matrix.clone());
      }
    });

    return { count: list.length, matrices: list };
  }, []);

  return (
    <group {...props}>
      {/* Case */}
      <RoundedBox args={[2.95, 0.17, 1.12]} radius={0.05} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#c9bc9c" roughness={0.7} />
      </RoundedBox>

      {/* Keycaps */}
      <instancedMesh
        args={[undefined, undefined, count]}
        castShadow
        position={[0, 0.1, 0]}
        ref={(mesh) => {
          if (!mesh) return;
          matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[KEY, 0.06, KEY]} />
        <meshStandardMaterial color="#ddd2b8" roughness={0.55} />
      </instancedMesh>

      {/* Space bar */}
      <mesh position={[0.06, 0.1, 0.44]} castShadow>
        <boxGeometry args={[1.1, 0.06, KEY]} />
        <meshStandardMaterial color="#ddd2b8" roughness={0.55} />
      </mesh>

      {/* Status LEDs */}
      {[-1.25, -1.15].map((x, i) => (
        <mesh key={x} position={[x, 0.086, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.022, 12]} />
          <meshBasicMaterial color={i === 0 ? "#7cffb2" : "#3a4a40"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
