"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/ui/Nav";
import Loader from "@/components/ui/Loader";
import Scrim from "@/components/ui/Scrim";
import {
  Credits,
  MusicHero,
  MusicOutro,
  Tracklist,
  Transport,
  Video,
} from "@/components/sections/MusicSections";

const VinylCanvas = dynamic(() => import("@/components/three/VinylCanvas"), {
  ssr: false,
});

export default function MusicPage() {
  return (
    <>
      <Loader />
      <Nav variant="page" />
      <VinylCanvas />
      {/* Lighter than the landing page's: the deck is still the subject all the
          way down, so the wash only has to buy the copy contrast, not hide the
          scene. */}
      <Scrim max={0.45} />

      <main>
        <MusicHero />
        <Tracklist />
        <Video />
        <Credits />
        <MusicOutro />
      </main>

      <Transport />
    </>
  );
}
