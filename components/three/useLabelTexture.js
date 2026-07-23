"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Tiny 2D-canvas texture for the moulded text on the plastic (brand badge,
 * "POWER", etc). Cheaper and sharper than a 3D text mesh, and it avoids
 * shipping a font atlas for six words.
 */
export function useLabelTexture(
  text,
  { width = 1024, height = 160, font = '500 56px "IBM Plex Mono", monospace', color = "#6f6553", letterSpacing = 10 } = {}
) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${letterSpacing}px`;

    // Shrink to fit rather than overflow — the web font may not be loaded when
    // this first runs, and the fallback metrics can be much wider.
    const maxWidth = width * 0.92;
    if (ctx.measureText(text).width > maxWidth) {
      const size = parseInt(font.match(/(\d+)px/)?.[1] ?? "56", 10);
      const shrunk = Math.floor(size * (maxWidth / ctx.measureText(text).width));
      ctx.font = font.replace(/\d+px/, `${shrunk}px`);
    }

    ctx.fillText(text, width / 2, height / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [text, width, height, font, color, letterSpacing]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return texture;
}
