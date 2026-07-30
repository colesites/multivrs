"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "system", icon: Monitor, label: "System theme" },
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
] as const;

const subscribeToHydration = () => () => undefined;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div className="flex items-center gap-0.5 rounded-full border border-[var(--hairline)] p-0.5 opacity-0">
        <div className="size-6" />
        <div className="size-6" />
        <div className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--hairline)] p-0.5">
      {MODES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={(e) => {
            e.preventDefault();
            setTheme(value);
          }}
          className={cn(
            "flex size-6 items-center justify-center rounded-full transition-colors",
            theme === value
              ? "bg-black/[0.08] dark:bg-white/[0.08] text-foreground"
              : "text-muted-foreground/70 hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
