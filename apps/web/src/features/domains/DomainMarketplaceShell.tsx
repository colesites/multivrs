"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { DomainCartSheet } from "./DomainCartSheet";
import { SavedDomainsSheet } from "./SavedDomainsSheet";

const Beams = dynamic(() => import("@/components/Beams"), { ssr: false });

/**
 * Static chrome for the domains route: background, layout, and the cart and
 * saved-domain sheets. None of it depends on the search, so it paints right
 * away and only the search experience inside it waits on data.
 */
export function DomainMarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="dark-marketing-header"
      className="relative min-h-screen overflow-hidden bg-black pt-16 text-white"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <Beams
          beamNumber={14}
          beamWidth={1.8}
          lightColor="#A855F7"
          speed={0.7}
          noiseIntensity={1.2}
          rotation={18}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-6">
        {children}
      </div>
      <DomainCartSheet />
      <SavedDomainsSheet />
    </main>
  );
}
