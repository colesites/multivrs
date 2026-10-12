import { SectionLoadingHeader } from "./SectionSkeletonParts";

const CARDS = ["one", "two", "three", "four"];

/** Mirrors TemplatesDashboard: header, toolbar, and compact template cards. */
export function TemplatesSectionSkeleton() {
  return (
    <main className="flex w-full flex-col gap-6 px-5 py-6" aria-busy>
      <SectionLoadingHeader
        title="Templates"
        description="Templates you sell in the Multivrs marketplace."
      />
      <div className="flex animate-pulse items-center gap-2">
        <div className="h-9 min-w-64 flex-1 rounded-md border border-(--hairline) bg-white/2" />
        <div className="size-10 rounded-md border border-(--hairline) bg-white/2" />
        <div className="h-10 w-18 rounded-lg border border-(--hairline) bg-white/2" />
      </div>
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {CARDS.map((card) => (
          <div
            className="overflow-hidden rounded-xl border border-(--hairline)"
            key={card}
          >
            <div className="aspect-[16/10] border-b border-(--hairline) bg-white/3" />
            <div className="flex items-center gap-2 px-3.5 py-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded-sm bg-white/8" />
                <div className="h-3 w-40 rounded-sm bg-white/4" />
              </div>
              <div className="h-3 w-12 rounded-sm bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
