import { useState } from "react";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate } from "../format";
import { SecretReveal } from "../secret-reveal";
import type { ApiKey, List } from "../types";
import { Button, Card, ErrorNote, Table, TableCell, TableRow } from "../ui";

export function ApiKeys() {
  const { data, error, reload } = useApi<List<ApiKey>>("/keys");
  const { run, pending } = useAction();
  const [created, setCreated] = useState<ApiKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function create(kind: ApiKey["kind"]) {
    const result = await run<ApiKey>("/keys", { body: { kind } });
    if (result.error) return setActionError(result.error);
    setCreated(result.data ?? null);
    reload();
  }
  async function revoke(id: string) {
    const result = await run(`/keys/${id}`, { method: "DELETE" });
    if (result.error) setActionError(result.error);
    reload();
  }

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
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => create("secret")}
          >
            New secret key
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => create("publishable")}
            variant="outline"
          >
            New publishable key
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        {created?.secret && (
          <SecretReveal
            label={`Your new ${created.kind} key`}
            value={created.secret}
          />
        )}
        {(error ?? actionError) && (
          <ErrorNote message={error ?? actionError ?? ""} />
        )}
        {data && data.data.length > 0 && (
          <Table head={["Key", "Type", "Created", ""]}>
            {data.data.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="px-4 font-mono text-xs text-ink">
                  {k.display_prefix}
                </TableCell>
                <TableCell className="px-4 text-ink-soft">{k.kind}</TableCell>
                <TableCell className="px-4 text-mute">
                  {formatDate(k.created)}
                </TableCell>
                <TableCell className="px-4">
                  {k.revoked ? (
                    <Badge status="revoked" />
                  ) : (
                    <Button
                      type="button"
                      disabled={pending}
                      onClick={() => revoke(k.id)}
                      variant="link"
                      className="h-auto px-0 text-sm text-red-700 hover:text-red-800"
                    >
                      Revoke
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
