import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

function title(action: string): string {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AccountActivity({ events }: { events: DashboardAuditEvent[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70">
      <div className="border-b border-(--hairline) px-5 py-4">
        <h2 className="text-sm font-semibold">Account activity</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Security-sensitive changes and platform lifecycle events.
        </p>
      </div>
      <div className="divide-y divide-(--hairline) px-5">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 py-3 text-sm">
            <span className="size-2 rounded-full bg-purple-400" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{title(event.action)}</span>
              <span className="text-xs text-muted-foreground">
                {event.projectName ?? event.entityType}
              </span>
            </span>
            <time className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleString()}
            </time>
          </div>
        ))}
        {!events.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No account activity yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
