"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate, formatPrice } from "../format";
import type { List, PaymentLink } from "../types";
import {
  ErrorNote,
  Loading,
  PageHeader,
} from "../ui";
import { PaymentLinkForm } from "./payment-link-form";

export function PaymentLinksView() {
  const { data, error, reload } =
    useApi<List<PaymentLink>>("/v1/payment_links");
  const { run, pending } = useAction();
  const [linkToDelete, setLinkToDelete] = useState<PaymentLink | null>(null);

  async function toggleActive(id: string, active: boolean) {
    await run(`/v1/payment_links/${id}`, { body: { active } });
    reload();
  }

  async function confirmDelete() {
    if (!linkToDelete) return;
    const id = linkToDelete.id;
    await run(`/v1/payment_links/${id}`, { method: "DELETE" });
    setLinkToDelete(null);
    reload();
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Payment"
        title="links"
        description="Sell a product without writing code: share its link, and each visit opens a secure checkout."
      />
      <PaymentLinkForm onCreated={reload} />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No links yet">
          Links you create show up here, ready to share anywhere.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Product", "Price", "Status", "Created", ""]}>
          {data.data.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="px-4">
                <p className="text-ink">{l.description}</p>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-600 hover:text-brand-700"
                >
                  {l.url.replace(/^https?:\/\//, "")}{" "}
                  <ExternalLink className="size-3" />
                </a>
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap font-mono text-ink">
                {formatPrice(l)}
              </TableCell>
              <TableCell className="px-4">
                <Badge status={l.active ? "active" : "off"} />
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap text-mute">
                {formatDate(l.created)}
              </TableCell>
              <TableCell className="px-4">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleActive(l.id, !l.active)}
                    variant="link"
                    className="h-auto px-0 whitespace-nowrap text-sm text-mute hover:text-ink"
                  >
                    {l.active ? "Turn off" : "Turn on"}
                  </Button>
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => setLinkToDelete(l)}
                    variant="link"
                    className="flex h-auto items-center gap-1 px-0 whitespace-nowrap text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      <Dialog
        open={Boolean(linkToDelete)}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-line bg-white p-6 shadow-2xl">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-base font-semibold text-ink">
              Delete payment link
            </DialogTitle>
            <DialogDescription className="text-sm text-mute">
              Are you sure you want to delete the payment link for{" "}
              <span className="font-medium text-ink">
                {linkToDelete?.description ?? "this product"}
              </span>
              ? This action cannot be undone and will permanently remove this link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setLinkToDelete(null)}
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
              {pending ? "Deleting..." : "Delete payment link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
