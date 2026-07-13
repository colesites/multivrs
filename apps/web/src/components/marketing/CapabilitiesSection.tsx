"use client";

import { useRef } from "react";
import {
  DeployArt,
  ScaleArt,
  SecureArt,
} from "@/components/marketing/art/capability-art";
import {
  drawOn,
  parallax,
  revealLines,
  revealUp,
  useGSAP,
} from "@/components/marketing/scroll";
import { cn } from "@/lib/utils";

type Pillar = {
  id: string;
  index: string;
  name: string;
  desc: string;
  features: string[];
  Art: (props: { className?: string }) => React.ReactElement;
};

const PILLARS: Pillar[] = [
  {
    id: "deploy",
    index: "01",
    name: "Deploy",
    desc: "Push to git and ship worldwide in seconds. Every commit gets an immutable preview, and production rolls out to the edge automatically.",
    features: [
      "Global CDN",
      "CI/CD pipelines",
      "Edge functions",
      "Preview deploys",
    ],
    Art: DeployArt,
  },
  {
    id: "scale",
    index: "02",
    name: "Scale",
    desc: "From your first user to your millionth. Compute that scales to zero and back, with isolation and insight baked into every request.",
    features: [
      "Fluid compute",
      "Auto-scaling",
      "Tenant isolation",
      "Observability",
    ],
    Art: ScaleArt,
  },
  {
    id: "secure",
    index: "03",
    name: "Secure",
    desc: "Security that's on by default. A managed firewall, bot defense, and DDoS mitigation stand in front of everything you run.",
    features: [
      "Web app firewall",
      "Bot management",
      "DDoS mitigation",
      "Platform security",
    ],
    Art: SecureArt,
  },
];

export function CapabilitiesSection() {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;

      // Section header: masked line reveal + fade for eyebrow/subtitle.
      revealLines(headingRef.current, { start: "top 85%" });
      revealUp(
        headerRef.current?.querySelectorAll<HTMLElement>("[data-reveal]"),
        {
          trigger: headerRef.current,
          start: "top 85%",
        },
      );

      // Per-pillar: stagger the copy, stroke-on the diagram, drift the panel.
      root.current
        .querySelectorAll<HTMLElement>("[data-pillar]")
        .forEach((pillar) => {
          revealUp(pillar.querySelectorAll<HTMLElement>("[data-reveal]"), {
            trigger: pillar,
            start: "top 78%",
            y: 28,
            stagger: 0.08,
          });
          drawOn(pillar.querySelectorAll<SVGElement>("[data-draw]"), {
            trigger: pillar,
            start: "top 72%",
          });
          parallax(pillar.querySelector("[data-parallax]"), {
            yPercent: -8,
            trigger: pillar,
          });
        });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="platform"
      className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"
    >
      {/* Section header */}
      <div ref={headerRef} className="max-w-2xl">
        <p
          data-reveal
          className="mb-5 font-mono text-xs tracking-[0.25em] text-white/40 uppercase"
        >
          The Platform
        </p>
        <h2
          ref={headingRef}
          className="font-clash text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white"
        >
          One platform for every layer of the stack.
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-xl font-acari text-base leading-relaxed text-white/50 sm:text-lg"
        >
          Deploy, scale, and secure your software on infrastructure built to
          disappear, so you can focus on what you ship, not where it runs.
        </p>
      </div>

      {/* Pillars */}
      <div className="mt-20 flex flex-col gap-px lg:mt-28">
        {PILLARS.map((pillar, i) => {
          const flipped = i % 2 === 1;
          return (
            <article
              key={pillar.id}
              data-pillar
              className="grid items-center gap-10 border-t border-white/10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24"
            >
              {/* Copy */}
              <div className={cn(flipped && "lg:order-2")}>
                <div data-reveal className="mb-6 flex items-center gap-3">
                  <span className="font-mono text-xs tracking-widest text-white/30">
                    {pillar.index}
                  </span>
                  <span className="h-px w-8 bg-white/15" />
                </div>
                <h3
                  data-reveal
                  className="font-clash text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-tight text-white"
                >
                  {pillar.name}
                </h3>
                <p
                  data-reveal
                  className="mt-6 max-w-md font-acari text-base leading-relaxed text-white/50"
                >
                  {pillar.desc}
                </p>
                <ul
                  data-reveal
                  className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-3"
                >
                  {pillar.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 font-mono text-[0.7rem] tracking-wider text-white/45 uppercase"
                    >
                      <span className="size-1 rounded-full bg-[#2563eb]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className={cn(flipped && "lg:order-1")}>
                <div
                  data-parallax
                  data-reveal
                  className="card-grain inner-glow relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015]"
                >
                  <pillar.Art className="size-44 lg:size-52" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
