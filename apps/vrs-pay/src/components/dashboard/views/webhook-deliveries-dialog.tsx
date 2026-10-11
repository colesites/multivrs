import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDateTime } from "../format";
import type { List, WebhookDelivery, WebhookEndpoint } from "../types";
import { Button, ErrorNote, Loading } from "../ui";

function lastResponse(d: WebhookDelivery): string {
  if (d.attempts === 0) return "Not sent yet";
  if (d.last_status_code) return `HTTP ${d.last_status_code}`;
  return d.last_error ?? "No response";
}

/** The endpoint's recent deliveries, with a resend button on each. */
export function WebhookDeliveriesDialog({
  endpoint,
  onClose,
}: {
  endpoint: WebhookEndpoint;
  onClose: () => void;
}) {
  const path = `/v1/webhook_endpoints/${endpoint.id}/deliveries`;
  const { data, error, loading, reload } = useApi<List<WebhookDelivery>>(path);
  const { run, pending } = useAction();

  async function resend(id: string) {
    await run(`${path}/${id}/retry`, {});
    reload();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deliveries</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">
            {endpoint.url}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            Refresh
          </Button>
        </div>
        {loading && <Loading label="Loading deliveries" />}
        {error && <ErrorNote message={error} />}
        {data && data.data.length === 0 && (
          <p className="py-6 text-center text-sm text-mute">
            No events sent to this endpoint yet.
          </p>
        )}
        {data && data.data.length > 0 && (
          <ul className="grid max-h-[60vh] gap-2 overflow-y-auto">
            {data.data.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-line px-3 py-2.5 text-sm"
              >
                <span className="min-w-0 flex-1 font-mono text-xs text-ink">
                  {d.event_type}
                </span>
                <Badge status={d.status} />
                <span className="text-xs text-ink-soft">{lastResponse(d)}</span>
                <span className="text-xs text-mute">
                  {d.attempts} {d.attempts === 1 ? "try" : "tries"} ·{" "}
                  {formatDateTime(d.created)}
                </span>
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  disabled={pending || endpoint.status !== "enabled"}
                  onClick={() => resend(d.id)}
                  className="px-0"
                >
                  Resend
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
