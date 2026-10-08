import { useMemo, useState } from "react";
import { useAction, useApi } from "../context";
import { formatDate, shortId } from "../format";
import type { Customer, List } from "../types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Empty,
  ErrorNote,
  Input,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";

export function CustomersView() {
  const { data, error, reload } = useApi<List<Customer>>("/v1/customers?limit=100");
  const { run, pending } = useAction();
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "paying">("all");
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!customerToDelete) return;
    const id = customerToDelete.id;
    setActionError(null);
    const result = await run(`/v1/customers/${id}`, { method: "DELETE" });
    setCustomerToDelete(null);
    if (result.error) {
      setActionError(result.error);
    } else {
      reload();
    }
  }

  const customers = data?.data ?? [];

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (filterMode === "paying" && !c.email && !c.name) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.external_id.toLowerCase().includes(q) ||
        c.metadata?.country?.toLowerCase().includes(q)
      );
    });
  }, [customers, query, filterMode]);

  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="customers"
        description="Search, view, and manage your customers, their emails, billing locations, and account details."
      />
      {error && <ErrorNote message={error} />}
      {actionError && <ErrorNote message={actionError} />}
      {!data && !error && <Loading />}

      {data && customers.length === 0 && (
        <Empty title="No customers yet">
          Customers will appear here when they complete a checkout or when created via the API.
        </Empty>
      )}

      {data && customers.length > 0 && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filterMode === "all"
                    ? "bg-ink text-white"
                    : "bg-line/40 text-mute hover:text-ink"
                }`}
              >
                All ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("paying")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filterMode === "paying"
                    ? "bg-ink text-white"
                    : "bg-line/40 text-mute hover:text-ink"
                }`}
              >
                With details ({customers.filter((c) => c.email || c.name).length})
              </button>
            </div>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name, email, or ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty title="No customers found">
              No customers match your search or filter criteria.
            </Empty>
          ) : (
            <Table head={["Customer", "Email", "Country", "Type", "Created", ""]}>
              {filtered.map((c) => {
                const displayName = c.name ?? (c.email ? c.email.split("@")[0] : null);
                const country = c.metadata?.country;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="px-4">
                      <p className="font-medium text-ink">
                        {displayName ?? "Guest customer"}
                      </p>
                      <p className="font-mono text-[11px] text-mute">
                        {shortId(c.id)}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 text-xs">
                      {c.email ? (
                        <span className="text-ink">{c.email}</span>
                      ) : (
                        <span className="text-mute">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-xs font-mono">
                      {country ? (
                        <span className="rounded bg-line/50 px-1.5 py-0.5 text-ink-soft">
                          {country.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-mute">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-xs text-ink-soft">
                      {c.type === "org" ? "Organization" : "User"}
                    </TableCell>
                    <TableCell className="px-4 text-xs text-mute">
                      {formatDate(c.created)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCustomerToDelete(c)}
                        className="h-7 text-xs text-mute hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </div>
      )}

      <Dialog
        open={Boolean(customerToDelete)}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-line bg-white p-6 shadow-2xl">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-base font-semibold text-ink">
              Delete customer
            </DialogTitle>
            <DialogDescription className="text-sm text-mute">
              Are you sure you want to delete{" "}
              <span className="font-medium text-ink">
                {customerToDelete?.name ?? customerToDelete?.email ?? "this customer"}
              </span>
              ? This action cannot be undone and will permanently remove this customer record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setCustomerToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {pending ? "Deleting..." : "Delete customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
