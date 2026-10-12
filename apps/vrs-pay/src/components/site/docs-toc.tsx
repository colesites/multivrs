"use client";

import { useEffect, useState } from "react";

/** How far below the top of the window a section counts as the one being read. */
const READING_LINE = 140;

/**
 * "On this page" links that mark the section being read. The last section
 * whose top has passed the reading line wins; at the bottom of the page, the
 * last section does, even when it's too short to reach the line.
 */
export function DocsToc({
  sections,
}: {
  sections: readonly { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= READING_LINE) current = id;
      }
      setActive(atBottom ? (sections.at(-1)?.id ?? current) : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm lg:flex-col lg:gap-0 lg:border-l lg:border-line">
      {sections.map((s) => {
        const isActive = s.id === active;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={isActive ? "location" : undefined}
              className={`block transition-colors lg:-ml-px lg:border-l lg:py-1.5 lg:pl-3 ${
                isActive
                  ? "font-medium text-brand-600 lg:border-brand-600"
                  : "text-ink-soft hover:text-ink lg:border-transparent"
              }`}
            >
              {s.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
