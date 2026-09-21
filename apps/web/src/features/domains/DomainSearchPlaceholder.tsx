import { Search } from "lucide-react";

/**
 * Shown for the instant it takes the search experience to read the URL. It is
 * the real landing copy and search field, inert, rather than a skeleton, so
 * the page never flashes grey blocks.
 */
export function DomainSearchPlaceholder() {
  return (
    <section className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center text-center">
      <h1 className="font-clash text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.95]">
        Find a domain for your
      </h1>
      <p className="mb-7 mt-6 text-sm text-white/45">Fast. At-cost. Private.</p>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <div className="flex h-12 w-full items-center border border-white/15 bg-black/60 pl-11 pr-12 text-sm text-white/35">
          Search a domain or describe your idea
        </div>
      </div>
    </section>
  );
}
