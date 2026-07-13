import { ArrowRight, Search } from "lucide-react";

export function DomainSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        aria-label="Search domains"
        placeholder="Search a domain or describe your idea"
        className="h-12 w-full border border-white/15 bg-black/60 pl-11 pr-12 text-sm text-white outline-none transition focus:border-white/45 focus:ring-2 focus:ring-white/10"
      />
      <span aria-hidden className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-white/45">
        <ArrowRight className="size-4" />
      </span>
    </div>
  );
}
