import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate } from "../format";
import { SecretReveal } from "../secret-reveal";
import type { List, WebhookEndpoint, WebhookTestResult } from "../types";
import {
  Button,
  Card,
  ErrorNote,
  Input,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { WebhookDeliveriesDialog } from "./webhook-deliveries-dialog";
import { WebhookEventsPicker } from "./webhook-events-picker";

const ENDPOINTS = "/v1/webhook_endpoints";

function eventsLabel(events: string[]): string {
  if (events.includes("*")) return "All events";
  const [only] = events;
  return events.length === 1 && only ? only : `${events.length} events`;
}

function testLabel(result: WebhookTestResult): string {
  if (result.ok) return `Test event delivered (HTTP ${result.status_code}).`;
  return `Test event failed: ${result.error ?? "no response"}.`;
}

export function Webhooks() {
  const { data, error, reload } = useApi<List<WebhookEndpoint>>(ENDPOINTS);
  const { data: types } = useApi<List<string>>(`${ENDPOINTS}/event_types`);
  const eventTypes = types?.data ?? [];
  const { run, pending } = useAction();
  const [events, setEvents] = useState<string[]>(["*"]);
  const [created, setCreated] = useState<WebhookEndpoint | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, WebhookTestResult>>({});
  const [editing, setEditing] = useState<WebhookEndpoint | null>(null);
  const [viewing, setViewing] = useState<WebhookEndpoint | null>(null);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (events.length === 0)
      return setActionError("Choose at least one event.");
    const form = event.currentTarget;
    const url = String(new FormData(form).get("url") ?? "");
    const result = await run<WebhookEndpoint>(ENDPOINTS, {
      body: { url, enabled_events: events },
    });
    if (result.error) return setActionError(result.error);
    setActionError(null);
    setCreated(result.data ?? null);
    setEvents(["*"]);
    form.reset();
    reload();
  }
  async function remove(id: string) {
    const result = await run(`${ENDPOINTS}/${id}`, { method: "DELETE" });
    if (result.error) setActionError(result.error);
    reload();
  }
  async function sendTest(id: string) {
    const result = await run<WebhookTestResult>(`${ENDPOINTS}/${id}/test`, {});
    if (result.error) return setActionError(result.error);
    if (result.data)
      setTests((t) => ({ ...t, [id]: result.data as WebhookTestResult }));
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Webhook endpoints</p>
      <p className="text-sm text-mute">
        We POST signed events (payment.succeeded, subscription.updated, …) here
        and retry for a day if your server is down.
      </p>
      <form onSubmit={add} className="mt-4 grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            name="url"
            type="url"
            required
            placeholder="https://your-app.com/api/vrs-webhooks"
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={pending}>
            Add endpoint
          </Button>
        </div>
        <WebhookEventsPicker
          eventTypes={eventTypes}
          value={events}
          onChange={setEvents}
        />
      </form>
      <div className="mt-4 grid gap-4">
        {created?.secret && (
          <SecretReveal
            label="Signing secret for this endpoint"
            value={created.secret}
          />
        )}
        {(error ?? actionError) && (
          <ErrorNote message={error ?? actionError ?? ""} />
        )}
        {data && data.data.length > 0 && (
          <Table head={["URL", "Events", "Status", "Added", ""]}>
            {data.data.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="px-4 max-w-xs font-mono text-xs text-ink">
                  <span className="block truncate">{e.url}</span>
                  {tests[e.id] && (
                    <span
                      className={`mt-1 block font-sans ${
                        tests[e.id]?.ok ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {testLabel(tests[e.id] as WebhookTestResult)}
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className="px-4 text-ink-soft"
                  title={e.enabled_events.join(", ")}
                >
                  {eventsLabel(e.enabled_events)}
                </TableCell>
                <TableCell className="px-4">
                  <Badge status={e.status} />
                </TableCell>
                <TableCell className="px-4 text-mute">
                  {formatDate(e.created)}
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex flex-wrap justify-end gap-x-3">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setViewing(e)}
                      className="h-auto px-0 text-sm"
                    >
                      Deliveries
                    </Button>
                    {e.status === "enabled" && (
                      <>
                        <Button
                          type="button"
                          variant="link"
                          disabled={pending}
                          onClick={() => sendTest(e.id)}
                          className="h-auto px-0 text-sm"
                        >
                          Send test
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setEditing(e)}
                          className="h-auto px-0 text-sm"
                        >
                          Edit events
                        </Button>
                        <Button
                          type="button"
                          disabled={pending}
                          onClick={() => remove(e.id)}
                          variant="link"
                          className="h-auto px-0 text-sm text-red-700 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
      {viewing && (
        <WebhookDeliveriesDialog
          endpoint={viewing}
          onClose={() => setViewing(null)}
        />
      )}
      {editing && (
        <EditEventsDialog
          endpoint={editing}
          eventTypes={eventTypes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </Card>
  );
}

function EditEventsDialog({
  endpoint,
  eventTypes,
  onClose,
  onSaved,
}: {
  endpoint: WebhookEndpoint;
  eventTypes: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { run, pending } = useAction();
  const [events, setEvents] = useState(endpoint.enabled_events);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (events.length === 0) return setError("Choose at least one event.");
    const result = await run(`${ENDPOINTS}/${endpoint.id}`, {
      method: "PATCH",
      body: { enabled_events: events },
    });
    if (result.error) return setError(result.error);
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Events to send</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">
            {endpoint.url}
          </DialogDescription>
        </DialogHeader>
        <WebhookEventsPicker
          eventTypes={eventTypes}
          value={events}
          onChange={setEvents}
        />
        {error && <ErrorNote message={error} />}
        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={pending} onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
