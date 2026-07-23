"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollRef } from "@/lib/store";
import { STOPS, buildField, stopForScroll } from "./formations";

/**
 * The cloud on /science: a few thousand points that reorganise as you scroll —
 * shell, clusters, helix, loss surface.
 *
 * Two meshes, one set of buffers. The points and the graph edges are the same
 * vertices; the LineSegments just draws an *indexed* view of them. Because both
 * geometries hold the very same BufferAttribute objects, uploading a new `aFrom`
 * updates the lines for free, and the two can never disagree about where a point
 * is — which is the failure mode if you keep parallel copies and morph both.
 *
 * The morph is entirely on the GPU: `aFrom` and `aTo` stay put and only the
 * `uMix` uniform moves. The CPU touches the buffers once per transition (six
 * times over the whole page), not once per frame.
 */

const MORPH_SECONDS = 1.5;

/** Which stops draw the graph edges. Clusters are the point of the edges — they
 *  are what makes it read as a knowledge graph rather than confetti — and the
 *  manifold gets a faint mesh so the surface has some structure to it. */
const EDGE_STRENGTH = { sphere: 0.0, clusters: 1.0, helix: 0.35, manifold: 0.55 };

const VERT = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute float aTint;
  varying float vTint;
  varying float vDepth;

  void main() {
    vTint = aTint;

    // smoothstep rather than a linear mix: points ease out of the old shape and
    // into the new one, so the cloud never snaps at either end of a transition.
    float k = smoothstep(0.0, 1.0, uMix);
    vec3 p = mix(aFrom, aTo, k);

    // Idle drift. Without it a settled formation is perfectly static and reads
    // as a still image rather than a live system.
    float w = uTime * 0.4 + aSeed * 6.2831853;
    p += vec3(sin(w), cos(w * 1.31), sin(w * 0.73)) * 0.04;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_PointSize = uSize * (0.55 + aSeed * 0.9) / max(vDepth, 0.001);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG_POINTS = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vTint;
  varying float vDepth;

  void main() {
    // Round the square point sprite off, and discard rather than rely on alpha:
    // additive blending would still brighten the corners.
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;

    float a = smoothstep(0.25, 0.02, d);
    // Depth fade stands in for fog, which does not apply to a raw ShaderMaterial.
    float near = smoothstep(12.0, 3.0, vDepth);
    gl_FragColor = vec4(mix(uColorA, uColorB, vTint), a * (0.2 + 0.8 * near));
  }
`;

const FRAG_LINES = /* glsl */ `
  uniform vec3 uColorA;
  uniform float uEdges;
  varying float vDepth;

  void main() {
    float near = smoothstep(12.0, 3.0, vDepth);
    gl_FragColor = vec4(uColorA, 0.14 * near * uEdges);
  }
`;

export default function PointField({ count = 1400 }) {
  const { size, viewport } = useThree();

  const field = useMemo(() => buildField(count), [count]);

  /* Attributes are created once and shared by both geometries. aFrom/aTo are
     the only ones that ever change, and only on a transition. */
  const attrs = useMemo(() => {
    const from = new THREE.BufferAttribute(new Float32Array(field.shapes.sphere), 3);
    const to = new THREE.BufferAttribute(new Float32Array(field.shapes.sphere), 3);
    from.setUsage(THREE.DynamicDrawUsage);
    to.setUsage(THREE.DynamicDrawUsage);
    return {
      from,
      to,
      seed: new THREE.BufferAttribute(field.seeds, 1),
      tint: new THREE.BufferAttribute(field.tints, 1),
      // `position` is never read by the shader, but three needs one to compute a
      // bounding sphere. Frustum culling is off for the same reason — the real
      // positions live in aFrom/aTo and three cannot see them.
      position: new THREE.BufferAttribute(new Float32Array(field.shapes.sphere), 3),
    };
  }, [field]);

  const uniforms = useMemo(
    () => ({
      uMix: { value: 1 },
      uTime: { value: 0 },
      uSize: { value: 60 },
      uEdges: { value: 0 },
      uColorA: { value: new THREE.Color("#7cffb2") },
      uColorB: { value: new THREE.Color("#ffb454") },
    }),
    []
  );

  const geometries = useMemo(() => {
    const points = new THREE.BufferGeometry();
    const lines = new THREE.BufferGeometry();
    for (const geo of [points, lines]) {
      geo.setAttribute("position", attrs.position);
      geo.setAttribute("aFrom", attrs.from);
      geo.setAttribute("aTo", attrs.to);
      geo.setAttribute("aSeed", attrs.seed);
      geo.setAttribute("aTint", attrs.tint);
    }
    lines.setIndex(new THREE.BufferAttribute(field.edges, 1));
    return { points, lines };
  }, [attrs, field]);

  const materials = useMemo(
    () => ({
      points: new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG_POINTS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      lines: new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG_LINES,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    }),
    [uniforms]
  );

  useEffect(
    () => () => {
      geometries.points.dispose();
      geometries.lines.dispose();
      materials.points.dispose();
      materials.lines.dispose();
    },
    [geometries, materials]
  );

  const morph = useRef({ stop: 0, mix: 1, edges: 0 });

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    uniforms.uTime.value += d;

    // Point size is in framebuffer pixels, so it has to track both the viewport
    // height and the DPR or the cloud is chunky on retina and specks on 4K.
    uniforms.uSize.value = size.height * viewport.dpr * 0.052;

    const want = stopForScroll(THREE.MathUtils.clamp(scrollRef.current, 0, 1));
    const m = morph.current;

    if (want !== m.stop) {
      // Snapshot where the points *currently* are into aFrom, so interrupting a
      // transition half-way continues from the shape on screen instead of
      // teleporting back to the last settled formation.
      const from = attrs.from.array;
      const to = attrs.to.array;
      const k = THREE.MathUtils.smoothstep(m.mix, 0, 1);
      for (let i = 0; i < from.length; i++) from[i] += (to[i] - from[i]) * k;
      to.set(field.order[want]);

      attrs.from.needsUpdate = true;
      attrs.to.needsUpdate = true;
      m.stop = want;
      m.mix = 0;
    }

    if (m.mix < 1) m.mix = Math.min(1, m.mix + d / MORPH_SECONDS);
    uniforms.uMix.value = m.mix;

    // Damped so edges dissolve rather than switch, and so a fast scroll through
    // three stops doesn't strobe them.
    const target = EDGE_STRENGTH[STOPS[m.stop].id] ?? 0;
    m.edges = THREE.MathUtils.damp(m.edges, target, 3, d);
    uniforms.uEdges.value = m.edges;
  });

  return (
    <group>
      <points geometry={geometries.points} material={materials.points} frustumCulled={false} />
      <lineSegments geometry={geometries.lines} material={materials.lines} frustumCulled={false} />
    </group>
  );
}
