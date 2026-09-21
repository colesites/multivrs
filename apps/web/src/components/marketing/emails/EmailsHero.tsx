"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import SpecularButton from "@/components/SpecularButton";
import { WordFlip } from "@/components/WordFlip";
import { authClient } from "@/lib/auth-client";
import { onIdle } from "@/lib/browser/idle";

const SceneFallback = () => (
  <div className="grid h-full w-full place-items-center" aria-hidden="true">
    <div className="size-56 rounded-full bg-[#A855F7]/15 blur-3xl" />
  </div>
);

const EnvelopeStackScene = dynamic(
  () =>
    import("./EnvelopeStackScene").then((module) => ({
      default: module.EnvelopeStackScene,
    })),
  { ssr: false, loading: SceneFallback },
);

/**
 * Mounts the WebGL scene without holding up the page.
 *
 * The scene's chunk is fetched as soon as the hero mounts, so the download and
 * parse overlap with hydration instead of starting after it. The canvas itself
 * still waits for the first idle moment, which keeps the main thread free for
 * the rest of the page.
 */
function useSceneReady() {
  const [state, setState] = useState<{ ready: boolean; animate: boolean }>({
    ready: false,
    animate: true,
  });
  useEffect(() => {
    void import("./EnvelopeStackScene");
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    return onIdle(() => setState({ ready: true, animate }), 400);
  }, []);
  return state;
}

const AUDIENCES = ["builders", "developers", "marketers", "businesses"];

export function EmailsHero() {
  const { data: session } = authClient.useSession();
  const username = session?.user?.username;
  const primaryHref = username ? `/${username}/~/email` : "/signup";
  const scene = useSceneReady();

  return (
    <section className="relative isolate flex min-h-[92svh] w-full items-center overflow-hidden bg-black text-white">
      {/* Background: soft top-right key light, diagonal streaks, film grain. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-white/[0.06] blur-[120px]" />
        <div className="absolute right-[10%] top-1/3 h-80 w-80 rounded-full bg-[#A855F7]/[0.12] blur-[110px]" />
        <div className="absolute -left-1/4 top-[58%] h-40 w-[150%] -rotate-[14deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent blur-2xl" />
        <div className="absolute -left-1/4 top-[74%] h-24 w-[150%] -rotate-[11deg] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
      </div>

      <div className="marketing-container grid w-full items-center gap-4 pb-12 pt-28 lg:grid-cols-2 lg:gap-8 lg:pb-10 lg:pt-20">
        <div className="relative z-10 flex flex-col items-start lg:pl-[6%]">
          <h1 className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text font-clash text-[clamp(3.25rem,7.2vw,6.5rem)] font-semibold leading-[0.95] tracking-tight text-transparent">
            <span className="block">Email for</span>
            <WordFlip
              words={AUDIENCES}
              duration={2600}
              wordClassName=""
              className="align-top"
            />
          </h1>

          <p className="mt-7 max-w-md font-acari text-base leading-relaxed text-white/60 sm:text-lg">
            The fastest way from your code to a real inbox. Send transactional
            and campaign mail, and receive every reply, from your own domain.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2">
            <Link href={primaryHref}>
              <SpecularButton
                size="md"
                radius={14}
                tint="#ffffff"
                tintOpacity={0.06}
                baseColor="#161616"
                lineColor="#ffffff"
                textColor="#ffffff"
                className="group"
                forceTheme="dark"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  Get started
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </SpecularButton>
            </Link>
            <Link
              href="/docs"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              Documentation
            </Link>
          </div>
        </div>

        <div className="relative order-first h-[340px] w-full sm:h-[420px] lg:order-none lg:h-[min(640px,72svh)]">
          {scene.ready ? (
            <EnvelopeStackScene animate={scene.animate} />
          ) : (
            <SceneFallback />
          )}
        </div>
      </div>
    </section>
  );
}
