"use client";

import { MailboxView } from "@/features/mail/MailboxView";
import { MailCompose } from "@/features/mail/MailCompose";
import { MailMobileMenu } from "@/features/mail/MailMobileMenu";
import { MailOverview } from "@/features/mail/MailOverview";
import { MailResourcePage } from "@/features/mail/MailResourcePage";
import { useMailContext } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-navigation";
import { useState } from "react";

const mailboxViews = new Set<MailView>([
  "inbox",
  "starred",
  "sent",
  "drafts",
  "archive",
  "spam",
  "trash",
]);

export function MultivrsMailPage() {
  const {
    data,
    projectId,
    view,
    setView,
    composeOpen,
    setComposeOpen,
    reply,
    setReply,
    openCompose,
    query,
  } = useMailContext();

  const [menuOpen, setMenuOpen] = useState(false);

  let content = (
    <MailResourcePage
      data={data}
      projectId={projectId}
      query={query}
      view={view}
    />
  );
  if (view === "overview")
    content = <MailOverview data={data} onView={setView} />;
  if (mailboxViews.has(view))
    content = (
      <MailboxView
        data={data}
        onReply={(message) => {
          setReply(message);
          setComposeOpen(true);
        }}
        query={query}
        view={view}
      />
    );

  return (
    <>
      {content}
      <MailCompose
        mailboxes={data.mailboxes}
        onOpenChange={setComposeOpen}
        open={composeOpen}
        reply={reply}
      />
      <MailMobileMenu
        onOpenChange={setMenuOpen}
        onView={setView}
        open={menuOpen}
        view={view}
      />
    </>
  );
}

