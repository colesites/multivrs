import { useApi } from "../context";
import { formatDateTime, shortId } from "../format";
import type { List, VrsEvent } from "../types";
import {
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";

export function EventsView() {
  const { data, error } = useApi<List<VrsEvent>>("/v1/events?limit=100");
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Events"
        title=""
        description="Everything that happened in your account, as sent to your webhook endpoints."
      />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No events yet">
          Payments, subscriptions and refunds show up here.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Event", "Object", "Time"]}>
          {data.data.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="px-4 font-mono text-xs text-ink">
                {e.type}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-mute">
                {e.data.object.id ? shortId(e.data.object.id) : "—"}
              </TableCell>
              <TableCell className="px-4 text-mute">
                {formatDateTime(e.created)}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
