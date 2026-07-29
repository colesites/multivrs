import { SectionLoadingHeader } from "./SectionSkeletonParts";
import { SKELETON_ROWS } from "./skeleton.constants";

export function AnalyticsSectionSkeleton() {
  return (
    <main
      className="mx-auto max-w-[1400px] space-y-8 px-5 py-7 lg:px-8"
      aria-busy
    >
      <div className="flex items-end justify-between">
        <SectionLoadingHeader
          description="Deep insights into your platform's traffic and engagement."
          eyebrow="Audience intelligence"
          title="Analytics"
        />
        <div className="flex gap-5 border-white/8 border-b pb-2">
          {["24h", "7d", "30d"].map((period) => (
            <span
              className="text-xs uppercase text-muted-foreground"
              key={period}
            >
              {period}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {["Edge requests", "Average latency", "Server error rate"].map(
          (metric) => (
            <div className="border-white/8 border-y p-5" key={metric}>
              <p className="text-sm text-muted-foreground">{metric}</p>
              <div className="mt-5 h-8 w-24 animate-pulse rounded-sm bg-white/8" />
            </div>
          ),
        )}
      </div>
      <section className="border-white/8 border-y py-7">
        <h2 className="text-base font-semibold">Traffic timeline</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hourly requests from the serving edge.
        </p>
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-white/[0.025]" />
      </section>
      <div className="grid gap-8 md:grid-cols-2">
        {SKELETON_ROWS.slice(0, 2).map((item) => (
          <div
            className="h-56 animate-pulse rounded-xl border border-white/8 bg-white/2"
            key={item}
          />
        ))}
      </div>
    </main>
  );
}
