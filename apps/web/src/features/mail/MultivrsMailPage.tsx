"use client";

import { type ComponentProps, Suspense, useState } from "react";
import { MailboxView } from "@/features/mail/MailboxView";
import { MailCompose } from "@/features/mail/MailCompose";
import { MailMobileMenu } from "@/features/mail/MailMobileMenu";
import { MailOverview } from "@/features/mail/MailOverview";
import { MailResourcePage } from "@/features/mail/MailResourcePage";
import { useMailContext, useMailData } from "@/features/mail/mail-context";
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
    <MailResourcePage projectId={projectId} query={query} view={view} />
  );
  if (view === "overview") content = <MailOverview onView={setView} />;
  if (mailboxViews.has(view))
    content = (
      <MailboxView
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
      {/* Compose needs the mailboxes; it waits for them without holding up the page. */}
      <Suspense fallback={null}>
        <ComposeWithMailboxes
          onOpenChange={setComposeOpen}
          open={composeOpen}
          reply={reply}
          forward={forward}
        />
      </Suspense>
      <MailMobileMenu
        onOpenChange={setMenuOpen}
        onView={setView}
        open={menuOpen}
        view={view}
      />
    </>
  );
}

function ComposeWithMailboxes(
  props: Omit<ComponentProps<typeof MailCompose>, "mailboxes">,
) {
  return <MailCompose mailboxes={useMailData().mailboxes} {...props} />;
}
