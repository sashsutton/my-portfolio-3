"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The glowing phosphor surface of the CRT.
 *
 * This mesh renders NO text — the readable UI is a DOM layer (see ScreenUI).
 * Its job is to be the light source: a bright, scanlined, flickering emissive
 * plane that the Bloom pass can smear into the beige bezel. That split keeps
 * type crisp (real DOM) while the glow stays physical (real geometry).
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Bulge the surface outward like a real tube face. The offset is clamped to
    // be >= 0 so the corners never dip *behind* the plane and get swallowed by
    // the dark tube housing sitting just behind them.
    vec3 p = position;
    vec2 d = (uv - 0.5) * 2.0;
    p.z += 0.05 * (1.0 - clamp(dot(d, d) * 0.55, 0.0, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uBoot;      // 0 → 1, drives the power-on wipe
  uniform vec3  uColor;
  uniform float uIntensity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    vec2 c = uv * 2.0 - 1.0;

    // --- power-on: a hairline that snaps open vertically, then settles -----
    float open = smoothstep(0.0, 0.65, uBoot);
    float halfH = 0.5 * open * open;
    float mask = 1.0 - smoothstep(halfH, halfH + 0.006, abs(uv.y - 0.5));
    // the bright collapsing line itself
    float hairline = (1.0 - smoothstep(0.0, 0.9, uBoot)) *
                     exp(-abs(uv.y - 0.5) * 260.0) * 3.0;

    // --- steady-state phosphor --------------------------------------------
    float scan   = 0.5 + 0.5 * sin(uv.y * 620.0);
    float scanned = mix(1.0, scan, 0.22);

    // Slow bright bar rolling up the tube.
    // Built from cos() rather than smoothstep(fract(...)) on purpose: fract has
    // a hard 1 → 0 wrap, and that discontinuity rasterises as a razor-thin
    // bright line sweeping the screen instead of a soft rolling band.
    float phase = uv.y * 0.5 - uTime * 0.06;
    float bar = 1.0 + 0.05 * pow(0.5 + 0.5 * cos(6.28318 * phase), 22.0);

    // mains-hum flicker, sampled per frame not per pixel
    float flicker = 0.955 + 0.045 * hash(vec2(floor(uTime * 24.0), 3.7));

    float vignette = 1.0 - dot(c, c) * 0.42;
    // Brightest across the middle of the tube. Must be C1-continuous at c.y = 0:
    // anything built on abs() has a kink there, and the kink rasterises as a
    // hard bright ridge across the screen that Bloom and CA then amplify.
    float edgeGlow = 0.24 + 0.5 * pow(max(0.0, 1.0 - c.y * c.y), 1.6);

    vec3 col = uColor * edgeGlow * scanned * bar * vignette * flicker;

    // phosphor grain
    col += uColor * 0.035 * hash(uv * 420.0 + fract(uTime));
    col += uColor * hairline;

    gl_FragColor = vec4(col * mask * uIntensity, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function CRTScreen({
  width = 2.56,
  height = 1.92,
  booted = false,
  color = "#7cffb2",
  intensity = 1,
  ...props
}) {
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBoot: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const material = useRef(null);
  const target = useRef(0);
  target.current = booted ? 1 : 0;

  useFrame((state, delta) => {
    // Animate through the material's OWN uniforms, never through the object
    // handed to the `uniforms` prop. That object is not guaranteed to be the
    // one the material ends up holding, and if it isn't, every per-frame write
    // silently goes nowhere: uTime and uBoot stay pinned at 0, which freezes
    // this shader mid-power-on (a bright hairline across a black tube).
    const u = material.current?.uniforms;
    if (!u) return;

    u.uTime.value = state.clock.elapsedTime;
    // Damped so the wipe eases open instead of popping.
    u.uBoot.value = THREE.MathUtils.damp(u.uBoot.value, target.current, 2.6, delta);
  });

  return (
    <mesh {...props}>
      <planeGeometry args={[width, height, 48, 36]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms}
        toneMapped={false}
      />
    </mesh>
  );
}
