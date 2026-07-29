"use client";

import { useState } from "react";
import { MailboxView } from "@/features/mail/MailboxView";
import { MailCompose } from "@/features/mail/MailCompose";
import { MailMobileMenu } from "@/features/mail/MailMobileMenu";
import { MailOverview } from "@/features/mail/MailOverview";
import { MailResourcePage } from "@/features/mail/MailResourcePage";
import { useMailContext } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-navigation";

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
    forward,
    setForward,
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
        projectId={projectId}
        onReply={(message) => {
          setForward(undefined);
          setReply(message);
          setComposeOpen(true);
        }}
        onForward={(message) => {
          setReply(undefined);
          setForward(message);
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
        forward={forward}
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
