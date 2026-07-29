import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";

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
      <DashboardSearchInput
        clearable
        containerClassName="flex-1"
        value={query}
        onValueChange={(value) => onQueryChange(value.toLowerCase())}
        placeholder="Search domains..."
      />
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
