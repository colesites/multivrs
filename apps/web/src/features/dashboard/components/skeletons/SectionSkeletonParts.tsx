import { DashboardPageHeader } from "../DashboardPageHeader";
import { SKELETON_ROWS } from "./skeleton.constants";

export function SectionLoadingHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return <DashboardPageHeader title={title} description={description} />;
}

export function SectionSkeletonHeader({
  titleWidth = "w-44",
  action = false,
}: {
  titleWidth?: string;
  action?: boolean;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className={`h-8 rounded-sm bg-white/8 ${titleWidth}`} />
        <div className="mt-2 h-4 w-80 max-w-full rounded-sm bg-white/4" />
      </div>
      {action ? <div className="h-9 w-28 rounded-lg bg-white/6" /> : null}
    </header>
  );
}

export function ProjectPickerSkeleton() {
  return (
    <main className="w-full animate-pulse space-y-6 px-5 py-6" aria-busy>
      <SectionSkeletonHeader titleWidth="w-52" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SKELETON_ROWS.slice(0, 3).map((row) => (
          <div
            className="h-36 rounded-xl border border-white/8 bg-white/3 p-5"
            key={row}
          >
            <div className="size-9 rounded-lg bg-white/7" />
            <div className="mt-5 h-4 w-1/2 rounded-sm bg-white/7" />
            <div className="mt-3 h-3 w-3/4 rounded-sm bg-white/4" />
          </div>
        ))}
      </div>
    </main>
  );
}
