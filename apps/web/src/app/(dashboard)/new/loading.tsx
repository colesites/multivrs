export default function NewProjectLoading() {
  return (
    <main className="min-h-svh bg-[#030303] pt-16 text-white" aria-busy>
      <div className="mx-auto max-w-5xl animate-pulse px-6 py-10">
        <div className="h-3 w-28 rounded-sm bg-purple-400/15" />
        <div className="mt-3 h-11 w-96 max-w-full rounded-xl bg-white/8" />
        <div className="mt-4 h-4 max-w-xl rounded-sm bg-white/4" />
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/2 p-6">
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-lg bg-white/6" />
            <div className="h-10 w-28 rounded-lg bg-white/10" />
          </div>
          <div className="my-6 h-px bg-white/8" />
          <div className="h-9 rounded-lg bg-white/5" />
          <div className="mt-4 space-y-px overflow-hidden rounded-xl border border-white/8">
            {["one", "two", "three", "four", "five"].map((item) => (
              <div className="h-16 bg-white/3" key={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
