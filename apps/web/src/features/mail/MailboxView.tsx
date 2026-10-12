"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MailReader } from "@/features/mail/MailReader";
import { MailThreadListSkeleton } from "@/features/mail/MailSkeletons";
import { MailThreadList } from "@/features/mail/MailThreadList";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import {
  useMailThread,
  useMailThreads,
} from "@/features/mail/mail-data.client";
import type { MailView } from "@/features/mail/mail-navigation";

export function MailboxView({
  onReply,
  onForward,
  projectId,
  query,
  view,
}: {
  onReply: (message: MailMessageDetail) => void;
  onForward: (message: MailMessageDetail) => void;
  projectId?: string;
  query: string;
  view: MailView;
}) {
  const router = useRouter();
  const list = useMailThreads(view, query);
  const [locallyReadThreadIds, setLocallyReadThreadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const threads: MailThreadSummary[] = list.threads.map((thread) =>
    locallyReadThreadIds.has(thread.id) ? { ...thread, unread: false } : thread,
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const params = useParams<{ username?: string }>();
  const selected = threads.find((thread) => thread.id === selectedId);
  const conversation = useMailThread(selected?.id);
  const messages = conversation.messages ?? [];
  const latestLoaded = messages[messages.length - 1];

  const currentIndex = selected
    ? threads.findIndex((t) => t.id === selected.id)
    : -1;

  /** Folder counts live on the server; lists and the open thread are client-side. */
  const refresh = useCallback(() => {
    router.refresh();
    void list.refresh();
    void conversation.refresh();
  }, [conversation, list, router]);

  const action = useCallback(
    async (messageId: string, mailAction: string, quiet = false) => {
      try {
        await updateMessage(messageId, mailAction);
        if (!quiet) toast.success("Conversation updated");
        refresh();
      } catch {
        toast.error("Email action failed");
      }
    },
    [refresh],
  );

  const openThread = useCallback(
    (threadId: string) => {
      setSelectedId(threadId);
      const thread = threads.find((item) => item.id === threadId);
      if (!thread?.unread || !thread.latestMessageId) return;
      setLocallyReadThreadIds((current) => {
        const next = new Set(current);
        next.add(threadId);
        return next;
      });
      void updateMessage(thread.latestMessageId, "read").catch(() => {
        setLocallyReadThreadIds((current) => {
          const next = new Set(current);
          next.delete(threadId);
          return next;
        });
        toast.error("Email action failed");
      });
    },
    [threads],
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
      const latestId = threads.find(
        (item) => item.id === threadId,
      )?.latestMessageId;
      if (latestId) await action(latestId, "star");
    },
    [action, threads],
  );

  // Keyboard shortcuts (J: next, K: prev, E: archive, R: reply). An effect
  // event reads the latest state without re-subscribing every render.
  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
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
      if (selected && latestLoaded) {
        e.preventDefault();
        onReply(latestLoaded);
      }
    } else if (e.key === "e" || e.key === "E") {
      if (selected?.latestMessageId) {
        e.preventDefault();
        void action(selected.latestMessageId, "archive");
      }
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

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
    refresh();
  }

  if (list.loading) return <MailThreadListSkeleton view={view} />;

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
        hasMore={list.hasMore}
        loadingMore={list.loadingMore}
        onEmptyTrash={
          view === "trash" && threads.length
            ? () => setConfirmEmpty(true)
            : undefined
        }
        onLoadMore={list.loadMore}
        onRefresh={refresh}
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
        loading={Boolean(selected) && conversation.loading}
        messages={messages}
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
