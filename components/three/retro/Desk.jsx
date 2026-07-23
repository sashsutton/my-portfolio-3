"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * The surface everything sits on. Kept deliberately dark and matte so the CRT
 * stays the only real light source in frame — the desk is there to catch the
 * screen's spill and ground the contact shadow, nothing more.
 */
export default function Desk({ y = -2.0 }) {
  // Procedural woodgrain: a few octaves of stretched noise baked once into a
  // small canvas. 512px is plenty at this grazing angle, and beats shipping a 2K
  // texture for something that is 90% in shadow.
  const map = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#241d16";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 220; i++) {
      const y0 = Math.random() * size;
      ctx.strokeStyle = `rgba(${60 + Math.random() * 40}, ${45 + Math.random() * 30}, ${32 + Math.random() * 22}, ${0.05 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.bezierCurveTo(size * 0.3, y0 + (Math.random() - 0.5) * 22, size * 0.7, y0 + (Math.random() - 0.5) * 22, size, y0 + (Math.random() - 0.5) * 10);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={map} color="#6a5c4a" roughness={0.85} metalness={0.05} />
    </mesh>
  );
}
