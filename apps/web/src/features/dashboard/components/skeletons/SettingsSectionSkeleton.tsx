import { SectionSkeletonHeader } from "./SectionSkeletonParts";
import { SKELETON_ROWS } from "./skeleton.constants";

export function SettingsSectionSkeleton({ account }: { account: boolean }) {
  if (!account)
    return (
      <main className="w-full animate-pulse space-y-6 px-5 py-6" aria-busy>
        <SectionSkeletonHeader titleWidth="w-32" />
        <section className="h-72 rounded-2xl border border-white/8 bg-white/2" />
        <section className="h-36 rounded-2xl border border-red-400/15 bg-red-400/3" />
      </main>
    );
  return (
    <main className="w-full animate-pulse px-5 py-6" aria-busy>
      <SectionSkeletonHeader titleWidth="w-32" />
      <div className="mt-6 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden space-y-1 lg:block">
          {SKELETON_ROWS.slice(0, 7).map((row) => (
            <div className="h-8 rounded-lg bg-white/3" key={row} />
          ))}
        </div>
        <div className="max-w-4xl space-y-5">
          <section className="h-80 rounded-2xl border border-white/8 bg-white/2" />
          <section className="h-56 rounded-2xl border border-white/8 bg-white/2" />
        </div>
      </div>
    </main>
  );
}
