import type { AnalyticsBreakdownItem } from "@/features/dashboard/types/analytics.types";

export function AnalyticsBreakdowns({
  paths,
  countries,
}: {
  paths: AnalyticsBreakdownItem[];
  countries: AnalyticsBreakdownItem[];
}) {
  return (
    <div className="grid divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      <Breakdown title="Top paths" items={paths} />
      <Breakdown title="Top countries" items={countries} />
    </div>
  );
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: AnalyticsBreakdownItem[];
}) {
  return (
    <section className="px-5 py-6 lg:px-7">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="font-geist-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Requests
        </span>
      </div>
      <div className="mt-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-[var(--hairline)] py-3 text-sm"
          >
            <span className="min-w-0 truncate text-muted-foreground">
              {item.label}
            </span>
            <span className="font-geist-mono text-xs text-foreground">
              {item.requests.toLocaleString()}
            </span>
          </div>
        ))}
        {!items.length && (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No request data yet.
          </p>
        )}
      </div>
    </section>
  );
}
