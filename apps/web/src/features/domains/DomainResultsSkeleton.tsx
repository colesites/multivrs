/** Fills the results area while a domain search is in flight. */

const TOP_RESULT_KEYS = ["one", "two", "three", "four"];
const ROW_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

export function DomainResultsSkeleton() {
  return (
    <output aria-label="Searching domains" className="block">
      <div className="mb-3 h-6 w-32 animate-pulse rounded bg-white/8" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TOP_RESULT_KEYS.map((key) => (
          <div
            className="h-28 animate-pulse border border-white/8 bg-white/3"
            key={key}
          />
        ))}
      </div>

      <div className="mb-3 mt-10 flex items-end justify-between gap-4">
        <div>
          <div className="h-6 w-28 animate-pulse rounded bg-white/8" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded bg-white/5" />
      </div>

      <div className="grid border-l border-t border-white/8 sm:grid-cols-2 lg:grid-cols-3">
        {ROW_KEYS.map((key) => (
          <div
            className="flex h-20 items-center justify-between border-r border-b border-white/8 px-4"
            key={key}
          >
            <div className="h-4 w-36 animate-pulse rounded bg-white/8" />
            <div className="h-4 w-14 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </output>
  );
}
