"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MailReader } from "@/features/mail/MailReader";
import { MailThreadList } from "@/features/mail/MailThreadList";
import type {
  MailDashboardData,
  MailMessageDetail,
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
  query,
  view,
}: {
  data: MailDashboardData;
  onReply: (message: MailMessageDetail) => void;
  query: string;
  view: MailView;
}) {
  const router = useRouter();
  const threads = data.threads.filter((thread) => {
    const messages = data.messages[thread.id] ?? [];
    const folder = folderByView[view];
    const matchesFolder =
      view === "starred"
        ? thread.starred
        : !folder || messages.some((message) => message.folder === folder);
    return (
      matchesFolder &&
      `${thread.subject} ${thread.correspondent} ${thread.preview}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  const [selectedId, setSelectedId] = useState<string | undefined>(
    threads[0]?.id,
  );
  const selected =
    threads.find((thread) => thread.id === selectedId) ?? threads[0];
  async function action(messageId: string, mailAction: string) {
    const response = await fetch(`/api/mail/messages/${messageId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: mailAction }),
    });
    if (!response.ok) {
      toast.error("Email action failed");
      return;
    }
    toast.success("Conversation updated");
    router.refresh();
  }
  return (
    <div className="flex min-h-[calc(100vh-7.5rem)]">
      <MailThreadList
        onSelect={setSelectedId}
        selectedId={selected?.id}
        threads={threads}
      />
      <MailReader
        messages={selected ? (data.messages[selected.id] ?? []) : []}
        onAction={action}
        onReply={onReply}
        thread={selected}
      />
    </div>
  );
}
