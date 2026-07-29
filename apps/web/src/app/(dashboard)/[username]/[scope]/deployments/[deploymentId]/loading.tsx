export default function DeploymentDetailLoading() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse space-y-7 px-5 py-8"
      aria-busy
    >
      <div className="h-4 w-36 rounded-sm bg-white/5" />
      <header className="border-white/8 border-b pb-7">
        <div className="h-9 w-72 rounded-lg bg-white/8" />
        <div className="mt-4 h-4 w-48 rounded-sm bg-white/4" />
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        {["status", "duration", "environment"].map((item) => (
          <div
            className="h-28 rounded-xl border border-white/8 bg-white/3"
            key={item}
          />
        ))}
      </section>
      <section className="h-80 rounded-xl border border-white/8 bg-black/40" />
    </main>
  );
}
