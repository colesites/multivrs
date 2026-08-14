import type { Metadata } from "next";
import { Suspense } from "react";
import { Services } from "@/components/marketing/Services";
import { FaqStream } from "@/components/marketing/FaqStream";
import { HeroSection } from "@/components/marketing/HeroSection";

export const metadata: Metadata = {
  title: "Multivrs | Software Ecosystem for Modern Teams",
  description:
    "Multivrs builds a connected software ecosystem: cloud deployment, developer tooling, AI workflows, and premium product experiences.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Hero section: Permanently in Dark Mode with cosmic MoltenMetal shader */}
      <div
        id="dark-marketing-header"
        className="relative z-10 dark text-foreground bg-black"
      >
        {/* Overscroll buffer for mobile rubber-banding at the top */}
        <div className="absolute inset-x-0 bottom-full h-[50vh] bg-black" />
        <HeroSection />
      </div>

      {/* Services section: Adapts to system / user Light and Dark theme */}
      <div className="relative z-10 text-foreground bg-background">
        <Services />
      </div>

      {/* FAQ stream */}
      <div className="relative z-10 text-foreground bg-background">
        <Suspense fallback={null}>
          <FaqStream page="home" />
        </Suspense>
      </div>
    </>
  );
}
