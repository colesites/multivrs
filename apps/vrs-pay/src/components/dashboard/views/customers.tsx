import { useApi } from "../context";
import { formatDate, shortId } from "../format";
import type { Customer, List } from "../types";
import {
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";

export function CustomersView() {
  const { data, error } = useApi<List<Customer>>("/v1/customers?limit=100");
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="customers"
        description="Your users and organizations, keyed by your own ids (external_id). They're created by your server or on a customer's first session."
      />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No customers yet">
          Create one with{" "}
          <code className="font-mono text-ink">POST /v1/customer_sessions</code>{" "}
          from your login code.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Customer", "Your id", "Type", "Created"]}>
          {data.data.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="px-4">
                <p className="text-ink">{c.name ?? c.email ?? "—"}</p>
                <p className="font-mono text-[11px] text-mute">
                  {shortId(c.id)}
                </p>
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-ink-soft">
                {c.external_id}
              </TableCell>
              <TableCell className="px-4 text-ink-soft">
                {c.type === "org" ? "Organization" : "User"}
              </TableCell>
              <TableCell className="px-4 text-mute">
                {formatDate(c.created)}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
