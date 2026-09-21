/** Placeholder for the filter bar and card grid while template data loads. */
export function TemplateGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
      <div className="flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          {["all", "one", "two", "three"].map((key) => (
            <div
              key={key}
              className="h-8 w-20 animate-pulse rounded bg-white/5"
            />
          ))}
        </div>
        <div className="flex gap-2.5">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-white/5" />
          <div className="size-10 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-12 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((key) => (
          <div className="flex flex-col" key={key}>
            <div className="aspect-16/10 w-full animate-pulse rounded-2xl border border-white/10 bg-white/3" />
            <div className="mt-3.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="size-7 animate-pulse rounded-full bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-white/10" />
                  <div className="h-2.5 w-16 animate-pulse rounded bg-white/5" />
                </div>
              </div>
              <div className="h-5 w-12 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
