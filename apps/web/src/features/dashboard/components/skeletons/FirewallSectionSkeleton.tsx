import { SectionLoadingHeader } from "./SectionSkeletonParts";
import { SKELETON_ROWS } from "./skeleton.constants";

export function FirewallSectionSkeleton() {
  return (
    <main className="w-full space-y-6 px-5 py-6" aria-busy>
      <SectionLoadingHeader
        description="Ordered traffic rules for the selected project."
        title="Firewall"
      />
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/2">
        <div className="h-20 border-white/8 border-b p-4">
          <h2 className="text-sm font-semibold">Custom rules</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Create, pause, and remove rules without redeploying.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3 border-white/8 border-b p-4">
          {["Rule name", "Path", "Starts with", "/admin or NG"].map((label) => (
            <div
              className="flex h-10 items-center rounded-lg border border-white/8 px-3 text-xs text-muted-foreground"
              key={label}
            >
              {label}
            </div>
          ))}
        </div>
        {SKELETON_ROWS.slice(0, 3).map((row) => (
          <div
            className="h-16 animate-pulse border-white/6 border-b bg-white/[0.025]"
            key={row}
          />
        ))}
      </section>
    </main>
  );
}
