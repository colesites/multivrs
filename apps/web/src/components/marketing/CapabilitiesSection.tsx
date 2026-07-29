"use client";

import { useRef } from "react";
import {
  gsap,
  revealLines,
  revealUp,
  useGSAP,
} from "@/components/marketing/scroll";

type Pillar = {
  id: string;
  index: string;
  name: string;
  desc: string;
  features: string[];
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
  },
];

export function CapabilitiesSection() {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Sticky scroll refs
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const textsRef = useRef<HTMLDivElement>(null);

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

      // Sticky scroll animation for pillars (Desktop only)
      if (
        window.innerWidth >= 768 &&
        pinWrapperRef.current &&
        textsRef.current
      ) {
        const texts = Array.from(textsRef.current.children);
        const total = PILLARS.length;

        if (texts.length === 0) return;

        // Ensure initially hidden except the first
        gsap.set(texts, { autoAlpha: 0, scale: 0.9, y: 50 });
        if (texts[0]) gsap.set(texts[0], { autoAlpha: 1, scale: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinWrapperRef.current,
            start: "top top",
            end: `+=${total * 100}%`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            // As we scroll through these pillars, we want to notify the 3D canvas
            // We can dispatch a custom event with the progress
            onUpdate: (self) => {
              window.dispatchEvent(
                new CustomEvent("multivrs-capabilities-scroll", {
                  detail: { progress: self.progress },
                }),
              );
            },
          },
        });

        for (let i = 0; i < total - 1; i++) {
          const currentText = texts[i];
          const nextText = texts[i + 1];

          if (!currentText || !nextText) continue;

          // Fade out current
          tl.to(
            currentText,
            { autoAlpha: 0, scale: 1.1, y: -50, duration: 1 },
            `step${i}`,
          );

          // Fade in next
          tl.to(
            nextText,
            { autoAlpha: 1, scale: 1, y: 0, duration: 1 },
            `step${i}+=0.5`,
          );
        }
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="platform"
      className="relative mx-auto w-full max-w-none pt-28 lg:pt-40"
    >
      {/* Section header */}
      <div
        ref={headerRef}
        className="max-w-4xl mx-auto px-6 lg:px-10 mb-20 lg:mb-32 text-center"
      >
        <p
          data-reveal
          className="mb-5 font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase"
        >
          The Platform
        </p>
        <h2
          ref={headingRef}
          className="font-clash text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-tight text-foreground"
        >
          One platform for every layer of the stack.
        </h2>
        <p
          data-reveal
          className="mt-6 mx-auto max-w-xl font-acari text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Deploy, scale, and secure your software on infrastructure built to
          disappear, so you can focus on what you ship, not where it runs.
        </p>
      </div>

      {/* Mobile Normal Layout (<768px) */}
      <div className="flex md:hidden flex-col gap-16 px-6 py-12 max-w-3xl mx-auto text-center">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.id}
            className="flex flex-col items-center text-center border-b border-border pb-16 last:border-0 last:pb-0"
          >
            <div className="mb-6 flex flex-col items-center gap-3">
              <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
                {pillar.index}
              </span>
              <span className="h-6 w-px bg-foreground/15" />
            </div>
            <h3 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-foreground drop-shadow-lg">
              {pillar.name}
            </h3>
            <p className="mt-4 font-acari text-base leading-relaxed text-foreground/70">
              {pillar.desc}
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
              {pillar.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase backdrop-blur-md bg-foreground/5 px-3 py-1.5 rounded-full border border-border"
                >
                  <span className="size-1.5 rounded-full bg-[#2563eb] shadow-[0_0_8px_#2563eb]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sticky Scroll Container (Desktop Only, >=768px) */}
      <div
        ref={pinWrapperRef}
        className="hidden md:flex h-screen w-full relative items-center justify-center pt-0 pb-0"
      >
        {/* Texts container - Centered */}
        <div
          ref={textsRef}
          className="relative w-full max-w-4xl px-6 lg:px-10 h-full flex flex-col justify-center items-center text-center"
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
            >
              <div className="mb-8 flex flex-col items-center gap-4">
                <span className="font-mono text-sm tracking-[0.3em] text-muted-foreground">
                  {pillar.index}
                </span>
                <span className="h-8 w-px bg-foreground/15" />
              </div>
              <h3 className="font-clash text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.8] tracking-tighter text-foreground drop-shadow-2xl mix-blend-plus-lighter">
                {pillar.name}
              </h3>
              <p className="mt-8 max-w-2xl font-acari text-xl leading-relaxed text-foreground/70 drop-shadow-lg">
                {pillar.desc}
              </p>
              <ul className="mt-12 flex flex-wrap justify-center max-w-3xl gap-x-8 gap-y-4">
                {pillar.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 font-mono text-sm tracking-widest text-muted-foreground uppercase backdrop-blur-md bg-foreground/5 px-4 py-2 rounded-full border border-border"
                  >
                    <span className="size-1.5 rounded-full bg-[#2563eb] shadow-[0_0_10px_#2563eb]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
