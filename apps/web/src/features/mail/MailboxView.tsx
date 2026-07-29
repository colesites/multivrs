"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MailReader } from "@/features/mail/MailReader";
import { MailThreadList } from "@/features/mail/MailThreadList";
import type {
  MailDashboardData,
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";

const folderByView: Partial<Record<MailView, string>> = {
  inbox: "inbox",
  sent: "sent",
  drafts: "drafts",
  archive: "archive",
  spam: "spam",
  trash: "trash",
};

export function MailboxView({
  data,
  onReply,
  onForward,
  projectId,
  query,
  view,
}: {
  data: MailDashboardData;
  onReply: (message: MailMessageDetail) => void;
  onForward: (message: MailMessageDetail) => void;
  projectId?: string;
  query: string;
  view: MailView;
}) {
  const router = useRouter();
  const [locallyReadThreadIds, setLocallyReadThreadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const threads = data.threads.reduce<MailThreadSummary[]>((matches, item) => {
    const thread = locallyReadThreadIds.has(item.id)
      ? { ...item, unread: false }
      : item;
    const messages = data.messages[thread.id] ?? [];
    const folder = folderByView[view];
    const matchesFolder =
      view === "starred"
        ? thread.starred
        : !folder || messages.some((message) => message.folder === folder);
    const matchesQuery =
      `${thread.subject} ${thread.correspondent} ${thread.preview}`
        .toLowerCase()
        .includes(query.toLowerCase());
    if (matchesFolder && matchesQuery) matches.push(thread);
    return matches;
  }, []);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = threads.find((thread) => thread.id === selectedId);
  const action = async (
    messageId: string,
    mailAction: string,
    quiet = false,
  ) => {
    try {
      await updateMessage(messageId, mailAction);
      if (!quiet) toast.success("Conversation updated");
      router.refresh();
    } catch {
      toast.error("Email action failed");
    }
  };
  const openThread = (threadId: string) => {
    setSelectedId(threadId);
    const thread = threads.find((item) => item.id === threadId);
    const latest = data.messages[threadId]?.at(-1);
    if (!thread?.unread || !latest) return;
    setLocallyReadThreadIds((current) => {
      const next = new Set(current);
      next.add(threadId);
      return next;
    });
    void updateMessage(latest.id, "read").catch(() => {
      setLocallyReadThreadIds((current) => {
        const next = new Set(current);
        next.delete(threadId);
        return next;
      });
      toast.error("Email action failed");
    });
  };

  async function emptyTrash() {
    if (
      !confirm(
        "Permanently delete every message in Trash? This cannot be undone.",
      )
    )
      return;
    const suffix = projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
    const response = await fetch(`/api/mail/messages${suffix}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Trash could not be emptied");
      return;
    }
    toast.success("Trash emptied");
    router.refresh();
  }
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden">
      <MailThreadList
        onEmptyTrash={
          view === "trash" && threads.length ? emptyTrash : undefined
        }
        onRefresh={() => router.refresh()}
        onSelect={openThread}
        selectedId={selected?.id}
        threads={threads}
      />
      <MailReader
        messages={selected ? (data.messages[selected.id] ?? []) : []}
        onAction={action}
        onForward={onForward}
        onReply={onReply}
        thread={selected}
      />
    </div>
  );
}
async function updateMessage(messageId: string, mailAction: string) {
  const response = await fetch(`/api/mail/messages/${messageId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: mailAction }),
  });
  if (!response.ok) throw new Error("Mail action failed");
}
