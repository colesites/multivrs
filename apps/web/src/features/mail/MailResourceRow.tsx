"use client";

import {
  CheckCircle2,
  CircleDashed,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  async function deleteItem(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete this ${view.slice(0, -1)}?`)) return;
    const response = await fetch(`/api/mail/${view}/${item.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Failed to delete ${view.slice(0, -1)}`);
      return;
    }
    toast.success(`${view.slice(0, -1)} deleted`);
    router.refresh();
  }

  function handleRowClick() {
    if (view === "domains" && params.username && params.scope) {
      router.push(`/${params.username}/${params.scope}/email/domains/${item.id}`);
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

  const interactiveProps = view === "domains" ? {
    onClick: handleRowClick,
    onKeyDown: handleKeyDown,
    role: "button",
    tabIndex: 0,
  } : {};

  return (
    <div 
      {...interactiveProps}
      className={`grid grid-cols-[1.4fr_.9fr_.45fr_32px] items-center gap-3 border-b border-white/[0.055] px-4 py-3.5 text-xs last:border-0 ${view === "domains" ? "cursor-pointer hover:bg-white/[0.02]" : ""}`}
    >
      <div className="min-w-0">
        <p className="truncate text-white/75">{item.name}</p>
        {item.createdAt ? (
          <p className="mt-1 text-[9px] text-white/25">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              timeZone: "UTC",
            })}
          </p>
        ) : null}
      </div>
      <p className="truncate text-white/35">{item.detail}</p>
      <span className="flex items-center gap-1.5 text-[10px] text-white/45">
        {healthy ? (
          <CheckCircle2 className="size-3 text-emerald-400" />
        ) : (
          <CircleDashed className="size-3 text-white/30" />
        )}
        {item.status}
      </span>
      {view === "domains" && item.status !== "verified" ? (
        <button aria-label="Verify DNS" onClick={verify} type="button">
          <RefreshCw className="size-3.5 text-white/40" />
        </button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More actions" type="button" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4 text-white/30 hover:text-white/70 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {(view === "mailboxes" || view === "domains") && (
              <DropdownMenuItem onClick={deleteItem} className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
