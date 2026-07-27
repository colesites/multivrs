"use client";

import {
  CheckCircle2,
  CircleDashed,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  async function verify() {
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
  const healthy =
    item.status === "verified" ||
    item.status === "active" ||
    item.status === "delivered";
  return (
    <div className="grid grid-cols-[1.4fr_.9fr_.45fr_32px] items-center gap-3 border-b border-white/[0.055] px-4 py-3.5 text-xs last:border-0">
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
        <button aria-label="More actions" type="button">
          <MoreHorizontal className="size-4 text-white/30" />
        </button>
      )}
    </div>
  );
}
