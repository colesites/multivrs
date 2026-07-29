import { SectionSkeletonHeader, SKELETON_ROWS } from "./SectionSkeletonParts";

export function EnvironmentSectionSkeleton() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse space-y-7 px-5 py-8"
      aria-busy
    >
      <SectionSkeletonHeader action titleWidth="w-64" />
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/2">
        <div className="h-20 border-white/8 border-b p-5">
          <div className="h-4 w-32 rounded bg-white/7" />
          <div className="mt-3 h-3 w-80 rounded bg-white/4" />
        </div>
        <div className="grid grid-cols-[1fr_1fr_120px] gap-3 border-white/8 border-b p-4">
          <div className="h-10 rounded bg-white/5" />
          <div className="h-10 rounded bg-white/5" />
          <div className="h-10 rounded bg-white/9" />
        </div>
        {SKELETON_ROWS.slice(0, 3).map((row) => (
          <div className="h-14 border-white/6 border-b bg-black/10" key={row} />
        ))}
      </section>
      <div className="h-3 w-3/4 rounded bg-white/4" />
    </main>
  );
}
