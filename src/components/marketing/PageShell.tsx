interface PageShellProps {
  title: string;
  description: string;
}

export function PageShell({ title, description }: PageShellProps) {
  return (
    <main className="min-h-svh bg-background px-6 py-28 lg:px-10">
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/4 p-8 sm:p-12">
        <p className="font-acari text-xs uppercase tracking-[0.2em] text-white/45">
          Multivrs
        </p>
        <h1 className="mt-3 font-clash text-4xl text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl font-acari text-base leading-relaxed text-white/70">
          {description}
        </p>
      </section>
    </main>
  );
}
