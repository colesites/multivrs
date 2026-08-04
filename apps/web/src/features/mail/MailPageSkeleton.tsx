export function MailPageSkeleton() {
  return (
    <div
      aria-label="Loading mail"
      role="status"
      className="w-full animate-pulse space-y-8 px-5 py-8 lg:px-8"
    >
      <section className="h-53 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" />
      <section className="grid gap-px overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#090b0f] p-5">
            <div className="size-4 rounded bg-black/5 dark:bg-white/5" />
            <div className="mt-5 h-8 w-24 rounded bg-black/5 dark:bg-white/5" />
            <div className="mt-2 h-3 w-16 rounded bg-black/5 dark:bg-white/5" />
          </div>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#090a0d]">
          <div className="border-b border-black/10 dark:border-white/10 p-4">
            <div className="h-5 w-40 rounded bg-black/5 dark:bg-white/5" />
            <div className="mt-2 h-3 w-56 rounded bg-black/5 dark:bg-white/5" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 px-4 py-3 last:border-0"
            >
              <div className="size-8 shrink-0 rounded-full bg-black/5 dark:bg-white/5" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-black/5 dark:bg-white/5" />
                <div className="h-2 w-1/2 rounded bg-black/5 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#090a0d] p-5">
          <div className="h-3 w-24 rounded bg-black/5 dark:bg-white/5" />
          <div className="mt-6 space-y-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3"
              >
                <div className="h-3 w-28 rounded bg-black/5 dark:bg-white/5" />
                <div className="h-3 w-10 rounded bg-black/5 dark:bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
