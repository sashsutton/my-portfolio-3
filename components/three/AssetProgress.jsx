"use client";

import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useAppStore } from "@/lib/store";

/**
 * Bridges three's loading manager to the app store.
 *
 * Lives inside the lazily-loaded 3D chunk on purpose: the loading screen needs
 * the numbers but must not pull @react-three/* (and therefore three.js) into
 * the initial bundle. Renders nothing.
 */
export default function AssetProgress() {
  const { progress, active } = useProgress();
  const report = useAppStore((s) => s.reportLoading);

  useEffect(() => {
    report({ chunkReady: true, loadingAssets: active, assetProgress: progress });
  }, [progress, active, report]);

  return null;
}
