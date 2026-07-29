import type { ProjectLayout } from "@/features/dashboard/components/ProjectsToolbar";

const CARD_KEYS = ["one", "two", "three", "four", "five", "six"];

export function ProjectCardsSkeleton({ layout }: { layout: ProjectLayout }) {
  return (
    <div
      aria-label="Loading projects"
      aria-live="polite"
      role="status"
      className={
        layout === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : "grid grid-cols-1 gap-3"
      }
    >
      {CARD_KEYS.map((key) => (
        <article
          className="h-[238px] animate-pulse rounded-2xl border border-[var(--hairline)] bg-[var(--ink-raised)]/55 p-5"
          key={key}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-[10px] bg-white/[0.07]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-white/[0.08]" />
              <div className="h-3 w-3/5 rounded bg-white/[0.045]" />
            </div>
          </div>
          <div className="mt-5 h-6 w-28 rounded-md bg-white/[0.05]" />
          <div className="mt-5 h-3.5 w-3/4 rounded bg-white/[0.07]" />
          <div className="mt-2 h-3 w-2/5 rounded bg-white/[0.04]" />
          <div className="mt-5 h-px bg-white/[0.06]" />
          <div className="mt-4 flex gap-3">
            <div className="h-3 flex-1 rounded bg-white/[0.04]" />
            <div className="h-3 flex-1 rounded bg-white/[0.04]" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProjectsUsageSkeleton() {
  return (
    <div
      className="animate-pulse space-y-8"
      aria-label="Loading usage"
      role="status"
    >
      <div className="space-y-3 border-b border-[var(--hairline)] pb-7">
        <div className="h-3 w-24 bg-white/[0.06]" />
        <div className="h-7 w-72 max-w-full bg-white/[0.08]" />
        <div className="h-4 w-96 max-w-full bg-white/[0.05]" />
      </div>
      <div className="h-72 rounded-xl border border-[var(--hairline)] bg-white/[0.018]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARD_KEYS.map((key) => (
          <div
            className="h-48 rounded-xl border border-[var(--hairline)] bg-white/[0.018]"
            key={key}
          />
        ))}
      </div>
    </div>
  );
}
