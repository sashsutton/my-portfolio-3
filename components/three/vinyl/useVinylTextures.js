"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { BAND_SEPARATORS, RECORD_R } from "./disc";

/**
 * Procedural record face: grooves, lead-in/lead-out land, and a centre label.
 *
 * Two 1024px canvases (well under the 2K budget) drawn in one pass:
 *
 *  - `map`          the colour you see
 *  - `roughnessMap` the same rings, but as roughness variation
 *
 * The roughness map is what actually makes it read as vinyl. A uniformly glossy
 * black disc looks like plastic; real records catch light in fine concentric
 * bands because the groove walls are angled. Varying roughness ring-by-ring
 * reproduces that against the Environment for a fraction of the cost of real
 * anisotropic shading.
 *
 * The cylinder cap's UVs map the disc into a circle inscribed in [0,1]², so
 * drawing concentric circles centred on the canvas lands them concentric on the
 * record. `size/2` in canvas px == the record's outer radius.
 */

const SIZE = 1024;

function drawFace({ labelColor, labelText, labelSub }) {
  const map = document.createElement("canvas");
  const rough = document.createElement("canvas");
  map.width = map.height = rough.width = rough.height = SIZE;

  const c = map.getContext("2d");
  const r = rough.getContext("2d");
  const mid = SIZE / 2;

  // --- base ---------------------------------------------------------------
  c.fillStyle = "#0a0a0b";
  c.fillRect(0, 0, SIZE, SIZE);
  // Baseline roughness. Deliberately high: this is the value the Environment
  // reflection rides on, and anything glossier turns a near-black albedo into a
  // uniform grey sheen — the disc stops reading as black vinyl entirely.
  r.fillStyle = "#969696";
  r.fillRect(0, 0, SIZE, SIZE);

  // Normalised radii, as a fraction of the record's outer edge.
  const LABEL_R = 0.3;
  const GROOVE_IN = 0.34;
  const GROOVE_OUT = 0.94;
  const RIM = 0.985;

  // --- grooves ------------------------------------------------------------
  // Irregular spacing on purpose: perfectly even rings alias into moiré as the
  // record spins and the camera moves.
  for (let radius = GROOVE_IN; radius < GROOVE_OUT; ) {
    const px = radius * mid;
    const jitter = 0.65 + Math.random() * 0.7;

    c.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.035})`;
    c.lineWidth = jitter;
    c.beginPath();
    c.arc(mid, mid, px, 0, Math.PI * 2);
    c.stroke();

    r.strokeStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.2})`;
    r.lineWidth = jitter * 1.6;
    r.beginPath();
    r.arc(mid, mid, px, 0, Math.PI * 2);
    r.stroke();

    radius += 0.0016 + Math.random() * 0.0012;
  }

  // Track separators — the wider, visibly shinier bands between tracks.
  // Derived from the tonearm's bands (see disc.js) so the needle always comes
  // down in a gap you can actually see rather than mid-track.
  BAND_SEPARATORS.map((r) => r / RECORD_R).forEach((radius) => {
    c.strokeStyle = "rgba(255,255,255,0.1)";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(mid, mid, radius * mid, 0, Math.PI * 2);
    c.stroke();

    r.strokeStyle = "rgba(0,0,0,0.45)";
    r.lineWidth = 4;
    r.beginPath();
    r.arc(mid, mid, radius * mid, 0, Math.PI * 2);
    r.stroke();
  });

  // Smooth lead-in land at the very edge — glossier than the grooved area.
  r.strokeStyle = "rgba(0,0,0,0.55)";
  r.lineWidth = (RIM - GROOVE_OUT) * mid;
  r.beginPath();
  r.arc(mid, mid, ((RIM + GROOVE_OUT) / 2) * mid, 0, Math.PI * 2);
  r.stroke();

  // --- label --------------------------------------------------------------
  c.fillStyle = labelColor;
  c.beginPath();
  c.arc(mid, mid, LABEL_R * mid, 0, Math.PI * 2);
  c.fill();

  // Paper label: matte, so it kills the reflection in the middle of the disc.
  r.fillStyle = "#e8e8e8";
  r.beginPath();
  r.arc(mid, mid, LABEL_R * mid, 0, Math.PI * 2);
  r.fill();

  c.save();
  c.translate(mid, mid);
  c.textAlign = "center";
  c.textBaseline = "middle";

  // Everything clears y ∈ [-22, 22] — the spindle hole punches through there.
  c.fillStyle = "rgba(10,10,11,0.9)";
  c.font = '600 32px "IBM Plex Mono", monospace';
  c.fillText(labelText, 0, -54);

  c.font = '400 20px "IBM Plex Mono", monospace';
  c.fillStyle = "rgba(10,10,11,0.62)";
  c.fillText(labelSub, 0, -28);

  c.font = '400 16px "IBM Plex Mono", monospace';
  c.fillText("33 ⅓ RPM", 0, 46);

  // Spindle hole.
  c.fillStyle = "#000";
  c.beginPath();
  c.arc(0, 0, 0.028 * mid, 0, Math.PI * 2);
  c.fill();
  c.restore();

  return { map, rough };
}

export function useVinylTextures({
  labelColor = "#c98a3a",
  labelText = "SASHA SUTTON",
  labelSub = "SIDE A",
} = {}) {
  const textures = useMemo(() => {
    if (typeof document === "undefined") return null;

    const { map, rough } = drawFace({ labelColor, labelText, labelSub });

    const colorTex = new THREE.CanvasTexture(map);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.anisotropy = 8;

    const roughTex = new THREE.CanvasTexture(rough);
    // Data map, not colour — must stay linear.
    roughTex.colorSpace = THREE.NoColorSpace;
    roughTex.anisotropy = 8;

    return { colorTex, roughTex };
  }, [labelColor, labelText, labelSub]);

  useEffect(
    () => () => {
      textures?.colorTex.dispose();
      textures?.roughTex.dispose();
    },
    [textures]
  );

  return textures;
}
