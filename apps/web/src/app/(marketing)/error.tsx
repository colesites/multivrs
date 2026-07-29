"use client";

export default function MarketingError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70svh] place-items-center px-6 text-center">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-white/40 uppercase">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          This page could not be loaded.
        </h1>
        <button
          className="mt-7 rounded-full border border-white/20 bg-white px-5 py-2.5 text-sm font-semibold text-black"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
