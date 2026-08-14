import type { LucideIcon } from "lucide-react";
import { SKELETON_ROWS } from "./skeleton.constants";

export function SectionLoadingHeader({
  description,
  eyebrow,
  icon: Icon,
  title,
}: {
  description: string;
  eyebrow: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {Icon ? (
        <div className="flex size-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/[0.06]">
          <Icon className="size-5 text-purple-300" />
        </div>
      ) : null}
    </header>
  );
}

export function SectionSkeletonHeader({
  titleWidth = "w-44",
  action = false,
}: {
  titleWidth?: string;
  action?: boolean;
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <div className="h-2.5 w-28 rounded-sm bg-purple-400/15" />
        <div className={`mt-3 h-7 rounded-sm bg-white/8 ${titleWidth}`} />
        <div className="mt-3 h-3 w-80 max-w-full rounded-sm bg-white/4" />
      </div>
      {action ? (
        <div className="size-10 rounded-xl border border-purple-400/15 bg-purple-400/5" />
      ) : null}
    </header>
  );
}

export function ProjectPickerSkeleton() {
  return (
    <main className="animate-pulse space-y-7 px-5 py-8 lg:px-8" aria-busy>
      <SectionSkeletonHeader titleWidth="w-52" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SKELETON_ROWS.slice(0, 3).map((row) => (
          <div
            className="h-36 rounded-xl border border-white/8 bg-white/3 p-5"
            key={row}
          >
            <div className="size-9 rounded-lg bg-white/7" />
            <div className="mt-5 h-4 w-1/2 rounded-sm bg-white/7" />
            <div className="mt-3 h-3 w-3/4 rounded-sm bg-white/4" />
          </div>
        ))}
      </div>
    </main>
  );
}
