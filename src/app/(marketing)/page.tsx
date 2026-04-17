import { HeroSection } from "@/components/hero/HeroSection";
import { PremiumProductShowcase } from "@/components/sections/PremiumProductShowcase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multivrs | Software Ecosystem for Modern Teams",
  description:
    "Multivrs builds a connected software ecosystem: cloud deployment, developer tooling, AI workflows, and premium product experiences.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <PremiumProductShowcase />
    </main>
  );
}
