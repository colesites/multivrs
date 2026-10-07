import { type FormEvent, useState } from "react";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate } from "../format";
import { SecretReveal } from "../secret-reveal";
import type { List, WebhookEndpoint } from "../types";
import {
  Button,
  Card,
  ErrorNote,
  Input,
  Table,
  TableCell,
  TableRow,
} from "../ui";

export function Webhooks() {
  const { data, error, reload } = useApi<List<WebhookEndpoint>>(
    "/v1/webhook_endpoints",
  );
  const { run, pending } = useAction();
  const [created, setCreated] = useState<WebhookEndpoint | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const url = String(new FormData(form).get("url") ?? "");
    const result = await run<WebhookEndpoint>("/v1/webhook_endpoints", {
      body: { url },
    });
    if (result.error) return setActionError(result.error);
    setActionError(null);
    setCreated(result.data ?? null);
    form.reset();
    reload();
  }
  async function remove(id: string) {
    const result = await run(`/v1/webhook_endpoints/${id}`, {
      method: "DELETE",
    });
    if (result.error) setActionError(result.error);
    reload();
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Webhook endpoints</p>
      <p className="text-sm text-mute">
        We POST signed events (payment.succeeded, subscription.updated, …) here
        and retry for a day if your server is down.
      </p>
      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
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
                <TableCell className="px-4 max-w-xs truncate font-mono text-xs text-ink">
                  {e.url}
                </TableCell>
                <TableCell className="px-4 text-ink-soft">
                  {e.enabled_events.includes("*")
                    ? "All events"
                    : e.enabled_events.join(", ")}
                </TableCell>
                <TableCell className="px-4">
                  <Badge status={e.status} />
                </TableCell>
                <TableCell className="px-4 text-mute">
                  {formatDate(e.created)}
                </TableCell>
                <TableCell className="px-4">
                  {e.status === "enabled" && (
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(e.id)}
                      variant="link"
                      className="h-auto px-0 text-sm text-red-700 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </Card>
  );
}
