import {
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  Send,
  TriangleAlert,
} from "lucide-react";
import { WebhookPulseIllustration } from "./EmailsIllustrations";
import { CARD } from "./emails-cards";

const EVENTS = [
  {
    type: "email.queued",
    icon: Clock,
    tone: "text-zinc-500",
    to: "ada@example.com",
  },
  {
    type: "email.sent",
    icon: Send,
    tone: "text-sky-600 dark:text-sky-400",
    to: "ada@example.com",
  },
  {
    type: "email.delivered",
    icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-400",
    to: "ada@example.com",
  },
  {
    type: "email.opened",
    icon: Eye,
    tone: "text-purple-600 dark:text-purple-400",
    to: "ada@example.com",
  },
  {
    type: "email.received",
    icon: Inbox,
    tone: "text-cyan-600 dark:text-cyan-400",
    to: "support@acme.dev",
  },
  {
    type: "email.failed",
    icon: TriangleAlert,
    tone: "text-rose-600 dark:text-rose-400",
    to: "old@example.org",
  },
] as const;

export function WebhooksCard() {
  return (
    <div className={`${CARD} flex flex-col p-6 lg:col-span-3 lg:p-8`}>
      <h3 className="text-lg font-medium">Signed webhooks</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Get notified the moment a message is queued, sent, delivered, opened,
        received, or fails. Payloads are signed and retried.
      </p>
      <WebhookPulseIllustration className="mt-6 h-20 w-full text-foreground" />
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-background">
        {EVENTS.map(({ type, icon: Icon, tone, to }) => (
          <li
            key={type}
            className="flex items-center gap-3 px-4 py-2.5 text-xs"
          >
            <Icon className={`size-3.5 shrink-0 ${tone}`} />
            <span className="w-28 shrink-0 font-mono text-foreground">
              {type}
            </span>
            <span className="truncate text-muted-foreground">{to}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
