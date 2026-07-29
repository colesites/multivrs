"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[#0a0a0b] px-6 text-center">
      <div>
        <p className="font-mono text-xs tracking-[0.16em] text-blue-400 uppercase">
          Dashboard unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          We could not load this view.
        </h1>
        <button
          className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
