"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import {
  buildNavHref,
  DASHBOARD_NAV_ITEMS,
} from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

/**
 * Real, typeable search input with a live results dropdown. Filters dashboard
 * sections within the current scope; keyboard-driven (⌘K to focus, ↑/↓/↵/Esc).
 */
export function SidebarSearch() {
  const router = useRouter();
  const listId = useId();
  const { username, scope } = useDashboardScope();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const normalized = query.trim().toLowerCase();
  const results = (
    normalized
      ? DASHBOARD_NAV_ITEMS.filter((item) =>
          item.name.toLowerCase().includes(normalized),
        )
      : DASHBOARD_NAV_ITEMS
  ).slice(0, 8);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(buildNavHref(username, scope, slug));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <DashboardSearchInput
        ref={inputRef}
        aria-controls={listId}
        aria-expanded={open}
        aria-label="Search dashboard"
        containerClassName="bg-white/[0.015] focus-within:bg-white/[0.03]"
        onValueChange={(value) => {
          setQuery(value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search…"
        role="combobox"
        trailing={
          <kbd className="shrink-0 rounded-md border border-[var(--hairline)] bg-white/[0.02] px-1.5 py-0.5 font-geist-mono text-[10px] text-muted-foreground/80">
            ⌘K
          </kbd>
        }
        value={query}
      />

      {open && results.length > 0 && (
        <ul
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[var(--hairline-strong)] bg-[var(--ink-raised)] p-1 shadow-2xl"
        >
          {results.map((item, i) => (
            <li key={item.name}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                  i === active
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
