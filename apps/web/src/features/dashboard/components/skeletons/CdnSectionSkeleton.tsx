import { Zap } from "lucide-react";
import { SectionLoadingHeader } from "./SectionSkeletonParts";

export function CdnSectionSkeleton() {
  return (
    <main
      className="mx-auto max-w-5xl space-y-7 px-5 py-8"
      aria-busy
    >
      <SectionLoadingHeader
        description="Cache policy and edge services for the selected project."
        eyebrow="Global delivery"
        icon={Zap}
        title="CDN"
      />
      <section className="animate-pulse rounded-2xl border border-white/8 bg-white/2 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Cache behavior</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="h-20 rounded-xl border border-white/8 bg-black/20" />
          <div className="h-20 rounded-xl border border-white/8 bg-black/20" />
        </div>
        <div className="mt-5 h-10 rounded-lg bg-white/4" />
      </section>
      <section className="animate-pulse rounded-2xl border border-white/8 bg-white/2 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Edge telemetry</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {["compression", "stale", "browser"].map((item) => (
            <div
              className="h-24 rounded-xl border border-white/8 bg-black/20"
              key={item}
            />
          ))}
        </div>
      </section>
      <div className="flex animate-pulse gap-3">
        <div className="h-10 w-32 rounded-lg bg-white/10" />
        <div className="h-10 w-28 rounded-lg border border-white/8 bg-white/3" />
      </div>
    </main>
  );
}
