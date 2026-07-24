import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import SmoothScroll from "@/components/providers/SmoothScroll";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Display serif — the "premium" half of the serif/sans hierarchy.
const serif = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "Sasha Sutton — Data science & AI",
  description:
    "Sasha Sutton — M1 in Data, Knowledge & Hybrid AI (DKAI) at Université Paris-Saclay. NLP and computer vision.",
};

export const viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
          {/* Grain + scanlines sit above everything, including the canvas. */}
          <div className="veil" aria-hidden />
          <div className="grain" aria-hidden />
        </LanguageProvider>
        {/* Vercel Web Analytics — collects on the deployed site only. */}
        <Analytics />
      </body>
    </html>
  );
}
