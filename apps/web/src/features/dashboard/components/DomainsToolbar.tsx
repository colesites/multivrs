import { Search, X } from "lucide-react";
import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";

interface DomainsToolbarProps {
  marketplace: string;
  query: string;
  onConnect(): void;
  onQueryChange(value: string): void;
}

export function DomainsToolbar({
  marketplace,
  query,
  onConnect,
  onQueryChange,
}: DomainsToolbarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <label className="flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--ink-raised)]/60 px-3.5 backdrop-blur-md transition-colors focus-within:border-[var(--hairline-strong)]">
        <span className="sr-only">Search domains</span>
        <Search className="size-3.5 shrink-0 text-muted-foreground/70" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value.toLowerCase())}
          placeholder="Search domains..."
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground caret-accent outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="grid size-4 cursor-pointer place-items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <SpecularButton
          size="sm"
          tint="#ffffff"
          tintOpacity={0.05}
          lineColor="#888888"
          baseColor="#333333"
          textColor="#e5e5e5"
          onClick={onConnect}
        >
          Connect External
        </SpecularButton>
        <Link href={marketplace}>
          <SpecularButton
            size="sm"
            tint="#ffffff"
            tintOpacity={0.9}
            lineColor="#ffffff"
            baseColor="#ffffff"
            textColor="#000000"
          >
            Buy
          </SpecularButton>
        </Link>
      </div>
    </div>
  );
}
