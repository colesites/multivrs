export default function ImportProjectLoading() {
  return (
    <main className="min-h-svh bg-[#030303] px-6 pt-24 text-white" aria-busy>
      <div className="mx-auto grid max-w-6xl animate-pulse gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="h-4 w-40 rounded-sm bg-purple-400/15" />
          <div className="mt-4 h-10 w-80 rounded-lg bg-white/8" />
          <div className="mt-10 space-y-5">
            {["framework", "root", "build", "output"].map((item) => (
              <div
                className="h-16 rounded-xl border border-white/8 bg-white/3"
                key={item}
              />
            ))}
          </div>
        </section>
        <aside className="h-96 rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="h-6 w-32 rounded-sm bg-white/8" />
          <div className="mt-8 h-40 rounded-xl bg-black/40" />
          <div className="mt-8 h-11 rounded-lg bg-white/10" />
        </aside>
      </div>
    </main>
  );
}
