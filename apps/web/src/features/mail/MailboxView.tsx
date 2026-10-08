"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
      `${thread.subject} ${thread.correspondent} ${thread.correspondentName || ""} ${thread.preview}`
        .toLowerCase()
        .includes(query.toLowerCase());
    if (matchesFolder && matchesQuery) matches.push(thread);
    return matches;
  }, []);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const params = useParams<{ username?: string }>();
  const selected = threads.find((thread) => thread.id === selectedId);

  const currentIndex = selected
    ? threads.findIndex((t) => t.id === selected.id)
    : -1;

  const action = useCallback(
    async (
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
    },
    [router],
  );

  const openThread = useCallback(
    (threadId: string) => {
      setSelectedId(threadId);
      const thread = threads.find((item) => item.id === threadId);
      const threadMessages = data.messages[threadId];
      const latest = threadMessages?.[threadMessages.length - 1];
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
    },
    [data.messages, threads],
  );

  const handleNavigate = useCallback(
    (delta: -1 | 1) => {
      if (!threads.length) return;
      if (currentIndex === -1) {
        if (threads[0]) openThread(threads[0].id);
        return;
      }
      const nextThread = threads[currentIndex + delta];
      if (nextThread) {
        openThread(nextThread.id);
      }
    },
    [currentIndex, openThread, threads],
  );

  const handleToggleStar = useCallback(
    async (threadId: string) => {
      const threadMessages = data.messages[threadId];
      const latest = threadMessages?.[threadMessages.length - 1];
      if (!latest) return;
      await action(latest.id, "star");
    },
    [action, data.messages],
  );

  // Keyboard shortcuts (J: next, K: prev, E: archive, R: reply)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleNavigate(1);
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        handleNavigate(-1);
      } else if (e.key === "r" || e.key === "R") {
        if (selected) {
          const threadMessages = data.messages[selected.id];
          const latest = threadMessages?.[threadMessages.length - 1];
          if (latest) {
            e.preventDefault();
            onReply(latest);
          }
        }
      } else if (e.key === "e" || e.key === "E") {
        if (selected) {
          const threadMessages = data.messages[selected.id];
          const latest = threadMessages?.[threadMessages.length - 1];
          if (latest) {
            e.preventDefault();
            void action(latest.id, "archive");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [action, data.messages, handleNavigate, onReply, selected]);

  async function emptyTrash() {
    setConfirmEmpty(false);
    const query = new URLSearchParams(
      projectId
        ? { projectId }
        : params.username
          ? { account: params.username }
          : {},
    ).toString();
    const suffix = query ? `?${query}` : "";
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
    <div
      className="flex h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] min-h-0 w-full overflow-hidden bg-background dark:bg-[#07080a]"
      style={{
        height: "calc(100vh - 3.5rem)",
        maxHeight: "calc(100vh - 3.5rem)",
      }}
    >
      <MailThreadList
        className={selectedId ? "hidden md:flex" : "flex"}
        onEmptyTrash={
          view === "trash" && threads.length
            ? () => setConfirmEmpty(true)
            : undefined
        }
        onRefresh={() => router.refresh()}
        onSelect={openThread}
        onToggleStar={handleToggleStar}
        selectedId={selected?.id}
        threads={threads}
        view={view}
      />
      <MailReader
        className={
          selectedId
            ? "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background dark:bg-[#07080a]"
            : "hidden md:flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background dark:bg-[#07080a]"
        }
        currentIndex={currentIndex}
        messages={selected ? (data.messages[selected.id] ?? []) : []}
        onAction={action}
        onClose={() => setSelectedId(undefined)}
        onForward={onForward}
        onNavigate={handleNavigate}
        onReply={onReply}
        thread={selected}
        totalThreads={threads.length}
        view={view}
      />
      <ConfirmDialog
        confirmLabel="Empty Trash"
        description="Every message in Trash is permanently deleted. This can't be undone."
        onConfirm={() => void emptyTrash()}
        onOpenChange={setConfirmEmpty}
        open={confirmEmpty}
        title="Empty Trash?"
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
