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
import { useAction } from "../context";
import { CopyButton } from "../copy-button";
import { formatDate, formatDateTime } from "../format";
import { SecretReveal } from "../secret-reveal";
import type { ApiKey, List } from "../types";
import {
  Button,
  Card,
  ErrorNote,
  Input,
  NativeSelect,
  Table,
  TableCell,
  TableRow,
} from "../ui";

/** `sk_test_4f9K…` → `sk_test_4f9K••••••••`. */
function masked(prefix: string): string {
  return `${prefix.replace(/…$/, "")}••••••••`;
}

/**
 * A key's value: publishable keys in full, secret keys masked with Reveal
 * (test mode) — live secret keys were shown once, when made.
 */
export function KeyValue({ apiKey }: { apiKey: ApiKey }) {
  const { run, pending } = useAction();
  const [shown, setShown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    const result = await run<{ secret: string }>(
      `/keys/${apiKey.id}/reveal`,
      {},
    );
    if (result.error) return setError(result.error);
    setShown(result.data?.secret ?? null);
  }

  const full = apiKey.token ?? shown;
  if (full) {
    return (
      <span className="flex min-w-0 items-center gap-1">
        <code className="min-w-0 truncate font-mono text-xs text-ink">
          {full}
        </code>
        <CopyButton value={full} />
        {shown && (
          <Button
            type="button"
            variant="link"
            onClick={() => setShown(null)}
            className="h-auto px-0 text-xs"
          >
            Hide
          </Button>
        )}
      </span>
    );
  }
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2">
      <code className="font-mono text-xs text-ink-soft">
        {masked(apiKey.display_prefix)}
      </code>
      {apiKey.revealable && !apiKey.revoked ? (
        <Button
          type="button"
          variant="link"
          disabled={pending}
          onClick={reveal}
          className="h-auto px-0 text-xs"
        >
          Reveal
        </Button>
      ) : (
        !apiKey.revoked && (
          <span className="text-xs text-mute">Shown once, when made</span>
        )
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}

type Confirming = { key: ApiKey; action: "roll" | "revoke" } | null;

const CONFIRM_COPY = {
  roll: {
    title: "Roll this key?",
    body: "A new key replaces it straight away and the old one stops working. Put the new key in your code before you deploy.",
    button: "Roll key",
  },
  revoke: {
    title: "Revoke this key?",
    body: "It stops working straight away. This can't be undone.",
    button: "Revoke key",
  },
} as const;

export function ApiKeys({
  data,
  error,
  reload,
}: {
  data: List<ApiKey> | null;
  error: string | null;
  reload: () => void;
}) {
  const { run, pending } = useAction();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<ApiKey | null>(null);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [showRevoked, setShowRevoked] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await run<ApiKey>("/keys", {
      body: {
        kind: String(form.get("kind")),
        name: String(form.get("name") ?? ""),
      },
    });
    if (result.error) return setActionError(result.error);
    setActionError(null);
    setCreated(result.data ?? null);
    setCreating(false);
    reload();
  }

  async function confirm() {
    if (!confirming) return;
    const { key, action } = confirming;
    const result =
      action === "roll"
        ? await run<ApiKey>(`/keys/${key.id}/roll`, {})
        : await run(`/keys/${key.id}`, { method: "DELETE" });
    setConfirming(null);
    if (result.error) return setActionError(result.error);
    setActionError(null);
    if (action === "roll") setCreated((result.data as ApiKey) ?? null);
    reload();
  }

  const keys = data?.data ?? [];
  const visible = keys.filter((k) => showRevoked || !k.revoked);
  const revokedCount = keys.length - keys.filter((k) => !k.revoked).length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">API keys</p>
          <p className="text-sm text-mute">
            Secret keys (sk_) stay on your server. Publishable keys (pk_) are
            safe in browsers.
          </p>
        </div>
        {!creating && (
          <Button type="button" onClick={() => setCreating(true)}>
            Create key
          </Button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={create}
          className="mt-4 flex flex-wrap gap-2 rounded-xl border border-line p-3"
        >
          <Input
            name="name"
            placeholder="Name, e.g. Production server"
            maxLength={60}
            aria-label="Key name"
            className="min-w-0 flex-1"
          />
          <NativeSelect name="kind" defaultValue="secret" aria-label="Key type">
            <option value="secret">Secret key</option>
            <option value="publishable">Publishable key</option>
          </NativeSelect>
          <Button type="submit" disabled={pending}>
            Create
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCreating(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      <div className="mt-4 grid gap-4">
        {created?.secret &&
          created.kind === "secret" &&
          !created.revealable && (
            <SecretReveal label="Your new secret key" value={created.secret} />
          )}
        {(error ?? actionError) && (
          <ErrorNote message={error ?? actionError ?? ""} />
        )}
        {visible.length > 0 && (
          <Table head={["Name", "Key", "Activity", ""]}>
            {visible.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="px-4">
                  <span className="block text-sm text-ink">
                    {k.name ?? "Untitled"}
                  </span>
                  <span className="block text-xs text-mute">
                    {k.kind === "secret" ? "Secret" : "Publishable"}
                  </span>
                </TableCell>
                <TableCell className="max-w-[18rem] px-4">
                  <KeyValue apiKey={k} />
                </TableCell>
                <TableCell className="px-4 text-xs whitespace-nowrap">
                  <span className="block text-ink-soft">
                    {k.last_used
                      ? `Used ${formatDateTime(k.last_used)}`
                      : "Never used"}
                  </span>
                  <span className="block text-mute">
                    Created {formatDate(k.created)}
                  </span>
                </TableCell>
                <TableCell className="px-4">
                  {k.revoked ? (
                    <Badge status="revoked" />
                  ) : (
                    <span className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() =>
                          setConfirming({ key: k, action: "roll" })
                        }
                        className="h-auto px-0 text-sm"
                      >
                        Roll
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        onClick={() =>
                          setConfirming({ key: k, action: "revoke" })
                        }
                        className="h-auto px-0 text-sm text-red-700 hover:text-red-800"
                      >
                        Revoke
                      </Button>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
        {revokedCount > 0 && (
          <Button
            type="button"
            variant="link"
            onClick={() => setShowRevoked((v) => !v)}
            className="h-auto justify-self-start px-0 text-xs text-mute"
          >
            {showRevoked ? "Hide revoked keys" : `Show ${revokedCount} revoked`}
          </Button>
        )}
      </div>

      {confirming && (
        <Dialog open onOpenChange={(open) => !open && setConfirming(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{CONFIRM_COPY[confirming.action].title}</DialogTitle>
              <DialogDescription>
                {confirming.key.name ?? "Untitled"} ·{" "}
                {confirming.key.display_prefix}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-ink-soft">
              {CONFIRM_COPY[confirming.action].body}
            </p>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={confirm}
                className={
                  confirming.action === "revoke"
                    ? "bg-red-700 hover:bg-red-800"
                    : ""
                }
              >
                {CONFIRM_COPY[confirming.action].button}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
