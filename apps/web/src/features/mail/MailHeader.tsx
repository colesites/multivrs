"use client";

import { MailPlus, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MailView } from "@/features/mail/mail-navigation";

const labels: Record<MailView, string> = {
  overview: "Overview",
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
  logs: "Email logs",
  broadcasts: "Broadcasts",
  automations: "Automations",
  templates: "Templates",
  contacts: "Contacts",
  audiences: "Audiences",
  domains: "Domains",
  mailboxes: "Mailboxes",
  credentials: "API & SMTP",
  webhooks: "Webhooks",
  analytics: "Analytics",
  settings: "Settings",
};

export function MailHeader({
  onMenu,
  onSearch,
  onCompose,
  view,
}: {
  onMenu: () => void;
  onSearch: (value: string) => void;
  onCompose: () => void;
  view: MailView;
}) {
  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-[var(--hairline)] bg-[var(--ink)]/80 px-4 backdrop-blur-xl md:px-6">
      <Button
        className="lg:hidden"
        onClick={onMenu}
        size="icon-sm"
        variant="ghost"
      >
        <Menu />
      </Button>
      <div>
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          {labels[view]}
        </h1>
      </div>
      <div className="relative ml-auto hidden w-full max-w-xs sm:block">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40" />
        <Input
          aria-label="Search mail"
          className="h-9 border-[var(--hairline)] bg-white/[0.02] pl-9 text-xs"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search mail and resources"
        />
      </div>
      <Button
        className="hidden sm:flex bg-foreground text-background hover:bg-foreground/90"
        onClick={onCompose}
        size="sm"
      >
        <MailPlus className="mr-2 size-3.5" />
        Compose
      </Button>
    </header>
  );
}
