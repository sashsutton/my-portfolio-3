"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/ui/Nav";
import Loader from "@/components/ui/Loader";
import Scrim from "@/components/ui/Scrim";
import {
  Education,
  Focus,
  Projects,
  Research,
  ScienceHero,
  ScienceOutro,
} from "@/components/sections/ScienceSections";

const LabCanvas = dynamic(() => import("@/components/three/LabCanvas"), {
  ssr: false,
});

export default function SciencePage() {
  return (
    <>
      <Loader />
      <Nav variant="page" />
      <LabCanvas />
      {/* Lighter than it used to be, on purpose. Legibility is now handled
          locally by `.block` in science.module.css, which blurs and darkens the
          scene only directly behind the copy. That frees this global wash to do
          much less, so the cloud stays bright and sharp in the open parts of the
          frame where there is nothing to read. Raise it if the page still feels
          busy; lower it toward 0 to show off more of the animation. */}
      <Scrim max={0.55} />

      <main>
        <ScienceHero />
        <Research />
        <Projects />
        <Education />
        <Focus />
        <ScienceOutro />
      </main>
    </>
  );
}
