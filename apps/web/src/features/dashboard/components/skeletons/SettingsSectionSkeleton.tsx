import { SectionSkeletonHeader, SKELETON_ROWS } from "./SectionSkeletonParts";

export function SettingsSectionSkeleton({ account }: { account: boolean }) {
  if (!account)
    return (
      <main className="mx-auto max-w-4xl animate-pulse px-5 py-10" aria-busy>
        <SectionSkeletonHeader titleWidth="w-32" />
        <section className="mt-8 space-y-5 border-white/8 border-y py-6">
          <div className="h-16 max-w-xl rounded-lg bg-white/4" />
          <div className="h-16 max-w-xl rounded-lg bg-white/4" />
          <div className="h-10 w-32 rounded-lg bg-white/10" />
        </section>
        <section className="mt-10 h-36 border border-red-400/15 bg-red-400/3 p-5">
          <div className="h-4 w-28 rounded bg-red-300/10" />
          <div className="mt-4 h-3 w-3/4 rounded bg-white/4" />
          <div className="mt-6 h-9 w-32 rounded bg-red-400/10" />
        </section>
      </main>
    );
  return (
    <main className="mx-auto max-w-[1000px] animate-pulse px-5 py-8" aria-busy>
      <SectionSkeletonHeader titleWidth="w-32" />
      <div className="mt-8 space-y-8">
        <section className="grid gap-5 border-white/8 border-y py-6 sm:grid-cols-2">
          <div className="h-16 rounded-lg bg-white/4" />
          <div className="h-16 rounded-lg bg-white/4" />
          <div className="h-10 w-32 rounded-lg bg-white/10" />
        </section>
        <section className="overflow-hidden rounded-xl border border-white/8">
          <div className="h-16 bg-white/3" />
          {SKELETON_ROWS.slice(0, 2).map((row) => (
            <div className="h-14 border-white/6 border-t" key={row} />
          ))}
        </section>
        <section className="h-48 rounded-xl border border-white/8 bg-white/2" />
      </div>
    </main>
  );
}
