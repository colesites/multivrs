"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

const LOCATIONS = [
  {
    id: "ng",
    name: "Lagos, Nigeria",
    visitors: "4,820",
    share: "38%",
    position: "left-[53%] top-[58%]",
  },
  {
    id: "us",
    name: "Ashburn, United States",
    visitors: "2,410",
    share: "19%",
    position: "left-[24%] top-[43%]",
  },
  {
    id: "gb",
    name: "London, United Kingdom",
    visitors: "1,260",
    share: "10%",
    position: "left-[45%] top-[35%]",
  },
  {
    id: "in",
    name: "Bengaluru, India",
    visitors: "984",
    share: "8%",
    position: "left-[69%] top-[57%]",
  },
] as const;

export function AudienceMap() {
  const [selected, setSelected] = useState("ng");
  const location =
    LOCATIONS.find((item) => item.id === selected) ?? LOCATIONS[0];

  return (
    <section className="relative overflow-hidden border-y border-[var(--hairline)] py-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-geist-mono text-[11px] uppercase tracking-[0.15em] text-blue-400">
            Live geography
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Where your audience is arriving from
          </h3>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Select a point to inspect a location
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
        <div className="relative aspect-[2/1] overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12),transparent_65%)]">
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 size-full"
            aria-label="Interactive audience world map"
            role="img"
          >
            <path
              d="M52 115l112-58 96 31 19 72-58 64-42-22-34 55-69-29-24-76zM300 265l66 13 39 77-21 106-45-18-29-92zM437 81l81-29 61 27 17 75-49 38-35-39-45 24-42-37zM501 201l92 23 54 60-26 129-52 44-61-60-26-119zM650 116l151-29 128 52 29 81-72 42-54-25-73 16-55-51zM752 288l91 35 46 79-66 43-60-55zM864 365l67 16 25 52-61 23-47-50z"
              fill="rgba(96,165,250,0.13)"
              stroke="rgba(147,197,253,0.35)"
              strokeWidth="2"
            />
            <path
              d="M0 250h1000M0 125h1000M0 375h1000M250 0v500M500 0v500M750 0v500"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
            />
          </svg>
          {LOCATIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              aria-label={`View analytics for ${item.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${item.position} ${selected === item.id ? "size-5 bg-blue-300/30 ring-1 ring-blue-200" : "size-3 bg-blue-400/80 hover:scale-150"}`}
            >
              <span className="absolute inset-1 rounded-full bg-blue-100" />
            </button>
          ))}
        </div>
        <div className="border-l border-[var(--hairline)] pl-5">
          <MapPin className="size-4 text-blue-400" />
          <p className="mt-4 text-sm font-medium text-foreground">
            {location.name}
          </p>
          <p className="mt-1 font-geist-mono text-3xl font-semibold tracking-tight text-foreground">
            {location.visitors}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            visitors · {location.share} of total traffic
          </p>
          <div className="mt-6 border-t border-[var(--hairline)] pt-4 text-xs text-muted-foreground">
            <p>
              Top path{" "}
              <span className="float-right font-geist-mono text-foreground">
                /pricing
              </span>
            </p>
            <p className="mt-3">
              Conversion{" "}
              <span className="float-right font-geist-mono text-emerald-400">
                4.8%
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
