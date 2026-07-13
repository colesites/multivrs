"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "system" | "light" | "dark";

const MODES: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "system", icon: Monitor, label: "System theme" },
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
];

/**
 * Segmented theme control. Visual selection only for now — the app ships
 * dark-only; wiring to a provider (next-themes) is a follow-up.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--hairline)] p-0.5">
      {MODES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={mode === value}
          onClick={(e) => {
            e.preventDefault();
            setMode(value);
          }}
          className={cn(
            "flex size-6 items-center justify-center rounded-full transition-colors",
            mode === value
              ? "bg-white/[0.08] text-foreground"
              : "text-muted-foreground/70 hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
