"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/ui/Nav";
import Loader from "@/components/ui/Loader";
import Scrim from "@/components/ui/Scrim";
import { About, Contact, Hero, Next, Work } from "@/components/sections/Sections";

/**
 * three.js + drei + postprocessing is by far the heaviest thing on the page and
 * cannot server-render, so it's split into its own chunk and loaded on the
 * client only. The DOM content ships and paints first; the canvas fades in
 * behind it once the chunk lands.
 */
const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <SceneCanvas />
      <Scrim />

      <main>
        <Hero />
        <About />
        <Work />
        <Next />
        <Contact />
      </main>
    </>
  );
}
