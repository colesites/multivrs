import { SectionSkeletonHeader } from "./SectionSkeletonParts";
import { SKELETON_ROWS } from "./skeleton.constants";

export function DeploymentsSectionSkeleton() {
  return (
    <main className="space-y-6 px-5 py-6">
      <SectionSkeletonHeader titleWidth="w-40" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 border border-white/8 bg-white/3" />
        <div className="h-9 w-40 border border-white/8 bg-white/3" />
      </div>
      <DeploymentsTableSkeleton />
    </main>
  );
}

export function DeploymentsTableSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-white/8"
      aria-label="Loading deployments"
      role="status"
    >
      {SKELETON_ROWS.map((row) => (
        <div className="h-20 border-white/6 border-b bg-white/2" key={row} />
      ))}
    </div>
  );
}

export function DomainsSectionSkeleton() {
  return (
    <main className="animate-pulse space-y-5 px-8 py-6" aria-busy>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg border border-white/8 bg-white/3" />
        <div className="h-10 w-32 rounded-lg bg-white/8" />
        <div className="h-10 w-28 rounded-lg bg-white/8" />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="h-11 border-white/8 border-b bg-white/4" />
        {SKELETON_ROWS.map((row) => (
          <div className="h-16 border-white/6 border-b bg-white/2" key={row} />
        ))}
      </div>
    </main>
  );
}

export function SandboxesSectionSkeleton() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse space-y-7 px-5 py-8"
      aria-busy
    >
      <SectionSkeletonHeader titleWidth="w-36" />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="h-80 rounded-2xl border border-white/8 bg-white/2 p-5">
          <div className="h-5 w-32 rounded-sm bg-white/7" />
          <div className="mt-7 space-y-4">
            {SKELETON_ROWS.slice(0, 4).map((row) => (
              <div className="h-11 rounded-lg bg-white/4" key={row} />
            ))}
          </div>
        </section>
        <section className="h-80 rounded-xl border border-white/8 bg-black/40" />
      </div>
    </main>
  );
}

export function WorkflowsSectionSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8" aria-busy>
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
          Durable execution
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Workflows
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Durable steps and UTC schedules for this project.
        </p>
      </header>
      <section>
        <h2 className="border-b border-[var(--hairline)] pb-3 font-geist-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Project workflows
        </h2>
        {SKELETON_ROWS.slice(0, 3).map((row) => (
          <div
            className="h-20 animate-pulse border-b border-[var(--hairline)] bg-white/[0.018]"
            key={row}
          />
        ))}
      </section>
    </main>
  );
}
