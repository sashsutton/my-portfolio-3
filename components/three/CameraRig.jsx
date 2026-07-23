"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollRef } from "@/lib/store";

/**
 * Scroll-driven camera choreography, shared by every scene.
 *
 * Keyframes are (scrollProgress → position, lookAt) pairs; we interpolate
 * between the two bracketing frames to get an *ideal* pose, then damp the real
 * camera toward it. The damp is what gives the move its weight — without it the
 * camera is welded to the scrollbar and feels like a slider.
 *
 * Scroll progress comes from `scrollRef`, which Lenis writes every frame. No
 * React state is involved, so this costs nothing per frame beyond the maths.
 *
 * @param keyframes  [{ at, pos: [x,y,z], look: [x,y,z] }], ascending by `at`
 * @param fit        how to keep the subject in frame on narrow viewports:
 *                   { landscape, portrait, subjectZ, baseZ }. `subjectZ` is how
 *                   far in front of the origin the thing being framed actually
 *                   sits — omit it and the fit overestimates the distance and
 *                   crops the subject's edges.
 * @param damping    lower = heavier, laggier camera
 */
export default function CameraRig({
  keyframes,
  fit = { landscape: 5, portrait: 3, subjectZ: 0, baseZ: 7.4 },
  damping = 2.2,
}) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useRef(new THREE.Vector3(...keyframes[0].look));

  const fitDistance = useMemo(() => {
    const aspect = size.width / size.height;
    const portrait = aspect < 1;

    const subjectWidth = portrait ? fit.portrait : fit.landscape;
    const subjectZ = portrait ? (fit.subjectZ ?? 0) : 0;

    const vFov = (camera.fov * Math.PI) / 180;
    const needed = subjectWidth / (2 * Math.tan(vFov / 2) * aspect) + subjectZ;
    return Math.max(0, needed - fit.baseZ);
  }, [size.width, size.height, camera.fov, fit.portrait, fit.landscape, fit.subjectZ, fit.baseZ]);

  useFrame((state, delta) => {
    const progress = THREE.MathUtils.clamp(scrollRef.current, 0, 1);

    let i = 0;
    while (i < keyframes.length - 2 && progress > keyframes[i + 1].at) i++;

    const a = keyframes[i];
    const b = keyframes[i + 1];
    const span = b.at - a.at;
    const raw = span > 0 ? (progress - a.at) / span : 0;
    // smoothstep on the segment so keyframe boundaries don't show as corners
    const k = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(raw, 0, 1), 0, 1);

    target.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], k),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], k),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], k) + fitDistance
    );
    look.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], k),
      THREE.MathUtils.lerp(a.look[1], b.look[1], k),
      THREE.MathUtils.lerp(a.look[2], b.look[2], k)
    );

    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, damping, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, damping, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, damping, delta);

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, look.x, damping, delta);
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, look.y, damping, delta);
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, look.z, damping, delta);
    camera.lookAt(currentLook.current);
  });

  return null;
}
