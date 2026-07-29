import { SectionLoadingHeader } from "./SectionSkeletonParts";

export function SpeedInsightsSectionSkeleton() {
  return (
    <main
      className="mx-auto max-w-6xl space-y-8 px-5 py-8"
      aria-busy
    >
      <SectionLoadingHeader
        description="Core Web Vitals collected from real visits."
        eyebrow="Real-user monitoring"
        title="Speed Insights"
      />
      <div className="grid border-white/8 border-y md:grid-cols-2 xl:grid-cols-4">
        {["CLS", "INP", "LCP", "TTFB"].map((vital) => (
          <article
            className="h-44 border-white/8 border-b p-5 md:border-r xl:border-b-0"
            key={vital}
          >
            <p className="font-geist-mono text-xs text-muted-foreground">{vital}</p>
            <div className="mt-7 h-9 w-24 animate-pulse rounded bg-white/9" />
            <p className="mt-4 text-xs text-muted-foreground">Loading field data…</p>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Multivrs measures Core Web Vitals from real visitors.
      </p>
    </main>
  );
}
