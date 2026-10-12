import { SectionLoadingHeader } from "./SectionSkeletonParts";

export function SpeedInsightsSectionSkeleton() {
  return (
    <main className="w-full space-y-6 px-5 py-6" aria-busy>
      <SectionLoadingHeader
        description="Core Web Vitals collected from real visits."
        title="Speed Insights"
      />
      <div className="grid border-white/8 border-y md:grid-cols-2 xl:grid-cols-4">
        {["CLS", "INP", "LCP", "TTFB"].map((vital) => (
          <article
            className="h-44 border-white/8 border-b p-5 md:border-r xl:border-b-0"
            key={vital}
          >
            <p className="font-geist-mono text-xs text-muted-foreground">
              {vital}
            </p>
            <div className="mt-7 h-9 w-24 animate-pulse rounded-sm bg-white/9" />
            <p className="mt-4 text-xs text-muted-foreground">
              Loading field data…
            </p>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Multivrs measures Core Web Vitals from real visitors.
      </p>
    </main>
  );
}
