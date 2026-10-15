"use client";

import {
  CheckCircle2,
  CircleDashed,
  Copy,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog, responseError } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MailboxEditDialog } from "@/features/mail/MailboxEditDialog";
import type { MailResourceItem } from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";

export function MailResourceRow({
  item,
  view,
}: {
  item: MailResourceItem;
  view: MailView;
}) {
  const router = useRouter();
  const params = useParams() as { username?: string; scope?: string };
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const noun = view.slice(0, -1);

  async function verify(e: React.MouseEvent) {
    e.stopPropagation();
    const response = await fetch(`/api/mail/domains/${item.id}/verify`, {
      method: "POST",
    });
    if (!response.ok) {
      toast.error("DNS verification failed");
      return;
    }
    toast.success("DNS checked");
    router.refresh();
  }

  async function deleteItem() {
    setDeleting(true);
    const response = await fetch(`/api/mail/${view}/${item.id}`, {
      method: "DELETE",
    }).catch(() => null);
    setDeleting(false);
    if (!response?.ok) {
      toast.error(
        await responseError(response, `Couldn't delete this ${noun}.`),
      );
      return;
    }
    setConfirming(false);
    toast.success(
      view === "credentials" ? `${item.name} revoked` : `${item.name} deleted`,
    );
    router.refresh();
  }

  function handleRowClick() {
    if (view === "domains" && params.username && params.scope) {
      router.push(
        `/${params.username}/${params.scope}/email/domains/${item.id}`,
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick();
    }
  }

  const healthy =
    item.status === "verified" ||
    item.status === "active" ||
    item.status === "delivered";

  const interactiveProps =
    view === "domains"
      ? {
          onClick: handleRowClick,
          onKeyDown: handleKeyDown,
          role: "button",
          tabIndex: 0,
        }
      : {};

  // The dialogs sit beside the row, not inside it: clicks in a dialog would
  // otherwise bubble to the row and open the domain being deleted.
  return (
    <>
      <div
        {...interactiveProps}
        className={`grid grid-cols-[1.4fr_.9fr_.45fr_32px] items-center gap-3 border-b border-border px-4 py-3.5 text-xs last:border-0 ${view === "domains" ? "cursor-pointer hover:bg-muted/50" : ""}`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-black dark:text-white">
            {item.name}
          </p>
          {item.createdAt ? (
            <p className="mt-1 text-[10px] text-black/60 dark:text-white/60">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                timeZone: "UTC",
              })}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="truncate font-mono text-xs text-black/70 dark:text-white/70">
            {item.detail}
          </p>
          {view === "mailboxes" && (
            <button
              type="button"
              title="Copy Mailbox ID"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item.id);
                toast.success("Mailbox ID copied to clipboard");
              }}
              className="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
            >
              <Copy className="size-3" />
            </button>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-black/60 dark:text-white/60">
          {healthy ? (
            <CheckCircle2 className="size-3 text-emerald-400" />
          ) : (
            <CircleDashed className="size-3 text-black/40 dark:text-white/40" />
          )}
          {item.status}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More actions"
              type="button"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4 text-black/40 dark:text-white/40 hover:text-black/90 dark:hover:text-white/90 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {view === "mailboxes" && (
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(item.id);
                  toast.success("Mailbox ID copied to clipboard");
                }}
              >
                <Copy className="size-3.5" />
                Copy Mailbox ID
              </DropdownMenuItem>
            )}
            {view === "domains" && item.status !== "verified" && (
              <DropdownMenuItem onClick={verify}>
                <RefreshCw className="size-3.5" />
                Check DNS now
              </DropdownMenuItem>
            )}
            {view === "mailboxes" && (
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setConfirming(true)}
              className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
            >
              <Trash2 className="size-3.5" />
              {view === "credentials" ? "Revoke" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {view === "mailboxes" && (
        <MailboxEditDialog
          mailbox={{
            id: item.id,
            name: item.name,
            address: item.address ?? item.detail,
            kind: item.kind ?? "shared",
          }}
          onOpenChange={setEditing}
          open={editing}
        />
      )}
      <ConfirmDialog
        busy={deleting}
        description={
          view === "domains"
            ? "This removes it from Multivrs and AWS. You can add it again to get new DKIM records, then replace the old ones at your DNS provider."
            : view === "credentials"
              ? "This will immediately revoke and delete this credential. Any applications using this API key or SMTP password will fail to authenticate."
              : `This permanently deletes this ${noun}.`
        }
        onConfirm={() => void deleteItem()}
        onOpenChange={setConfirming}
        open={confirming}
        title={view === "credentials" ? `Revoke ${item.name}?` : `Delete ${item.name}?`}
      />
    </>
  );
}
