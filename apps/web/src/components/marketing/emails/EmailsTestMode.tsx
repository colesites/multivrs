"use client";

import { useEffect, useState } from "react";
import { CARD } from "./emails-cards";

const TEST_IDS = [
  "26abdd24-36a9-475d-83bf",
  "cc3817db-d398-4892-8bc0",
  "4ea2f827-c3a2-471e-b0a1",
  "8e1d73b4-ebe1-485d-bce8",
  "a08045a6-122a-4e16-ace1",
];

export function TestModeCard() {
  const [count, setCount] = useState(2);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setCount(TEST_IDS.length);
      return;
    }
    const timer = setInterval(
      () => setCount((c) => (c >= TEST_IDS.length ? 1 : c + 1)),
      1400,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${CARD} flex flex-col p-6 lg:col-span-3 lg:p-8`}>
      <h3 className="text-lg font-medium">Test mode</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Test credentials run the full pipeline and record the message, without
        ever delivering to a real person.
      </p>
      <div className="mt-8 flex-1 rounded-xl border border-border bg-background p-4 font-mono text-[11px]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground">POST /api/v1/mail/send</span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
            test key
          </span>
        </div>
        <ul className="space-y-1.5">
          {TEST_IDS.slice(0, count).map((id) => (
            <li
              key={id}
              className="flex items-center gap-3 rounded-md bg-foreground/[0.04] px-3 py-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1"
            >
              <span className="text-emerald-600 dark:text-emerald-400">
                202
              </span>
              <span className="truncate text-foreground/80">
                {`{ "id": "${id}…", "status": "test" }`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
