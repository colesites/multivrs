import {
  CalendarClock,
  EyeOff,
  Fingerprint,
  KeyRound,
  ListX,
  type LucideIcon,
  Paperclip,
  Route,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { AuthEnvelope3D } from "./AuthEnvelope3D";

const ITEMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Verified DNS records",
    body: "Prove you are a legitimate sender. We generate SPF and DKIM records and check them until your domain is verified.",
  },
  {
    icon: Fingerprint,
    title: "DMARC protection",
    body: "Publish a DMARC policy so inbox providers know how to treat mail that fails authentication.",
  },
  {
    icon: Route,
    title: "Return-path & tracking domains",
    body: "Bounces and tracked links run through your own domain instead of a shared one.",
  },
  {
    icon: ListX,
    title: "Suppression history",
    body: "Contacts who unsubscribe or hard-bounce are suppressed, so you stop sending to people who don't want it.",
  },
  {
    icon: Webhook,
    title: "Replay-safe webhooks",
    body: "Every event is signed with HMAC SHA-256 and rejected outside a five-minute replay window.",
  },
  {
    icon: KeyRound,
    title: "Scoped credentials",
    body: "API and SMTP keys are scoped per project, hashed at rest, and shown exactly once.",
  },
  {
    icon: EyeOff,
    title: "Private by default",
    body: "Remote images in received mail stay blocked until the reader chooses to load them.",
  },
  {
    icon: CalendarClock,
    title: "Truthful delivery states",
    body: "Statuses change only when the provider reports an event. No optimistic guesses in your logs.",
  },
  {
    icon: Paperclip,
    title: "Attachments both ways",
    body: "Send up to five files per message and receive inbound attachments parsed and ready to download.",
  },
];

export function EmailsDeliverability() {
  return (
    <section className="w-full border-t border-border bg-background py-24 text-foreground lg:py-32">
      <div className="marketing-container">
        <div className="mb-14 grid items-center gap-10 lg:mb-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Deliverability
            </p>
            <h2 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
              Reach humans,
              <br />
              not spam folders.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Authentication, reputation, and privacy controls are built into
              every domain you connect, not bolted on later.
            </p>
          </div>
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <AuthEnvelope3D className="w-full max-w-sm text-foreground" />
          </div>
        </div>

        <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group border-b border-r border-border p-8 transition-colors hover:bg-foreground/[0.02]"
            >
              <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-[#A855F7]" />
              <h3 className="mt-6 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
