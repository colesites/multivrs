"use client";

import Image from "next/image";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

interface WorkspaceSwitcherProps {
  /** Display name for the account; falls back to the URL slug. */
  displayName?: string;
  /** Account avatar (the user's profile picture for a personal workspace). */
  image?: string | null;
  plan?: string;
}

export function WorkspaceSwitcher({
  displayName,
  image,
  plan = "Hobby",
}: WorkspaceSwitcherProps) {
  const { username } = useDashboardScope();
  const name = displayName ?? username;
  const initial = (name?.[0] ?? "M").toUpperCase();

  return (
    <div className="flex h-12 w-full items-center gap-2.5 rounded-lg px-2 text-left">
      {image ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="size-8 shrink-0 rounded-md border border-[var(--hairline-strong)] object-cover"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--hairline-strong)] bg-white/[0.04] font-geist-mono text-[13px] font-medium text-foreground">
          {initial}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
          {name}
        </span>
        <span className="truncate font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
          {plan}
        </span>
      </span>
    </div>
  );
}
