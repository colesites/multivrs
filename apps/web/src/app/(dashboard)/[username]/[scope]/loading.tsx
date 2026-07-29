export default function ProjectOverviewLoading() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse space-y-8 px-5 py-8"
      aria-busy
    >
      <header className="flex items-end justify-between border-white/8 border-b pb-7">
        <div>
          <div className="h-3 w-24 rounded-sm bg-blue-400/15" />
          <div className="mt-3 h-9 w-56 rounded-lg bg-white/8" />
          <div className="mt-3 h-3 w-32 rounded-sm bg-white/4" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-sm bg-white/6" />
          <div className="h-9 w-20 rounded-sm bg-white/10" />
        </div>
      </header>
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="h-72 rounded-2xl border border-white/8 bg-white/3" />
        <div className="h-72 rounded-2xl border border-white/8 bg-white/3" />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-2xl border border-white/8 bg-white/3" />
        <div className="h-48 rounded-2xl border border-white/8 bg-white/3" />
      </section>
    </main>
  );
}
