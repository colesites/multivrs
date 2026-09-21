import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { InboundRoutingIllustration } from "./EmailsIllustrations";

const THREADS = [
  {
    from: "security@linear.app",
    name: "Linear",
    subject: "New personal API key generated",
    preview: "A new key was created for your workspace…",
    time: "2m",
    unread: true,
  },
  {
    from: "noreply@github.com",
    name: "GitHub",
    subject: "[multivrs/core] Release v2.4.0",
    preview: "The release workflow finished successfully.",
    time: "14m",
    unread: true,
  },
  {
    from: "receipts@stripe.com",
    name: "Stripe",
    subject: "Your receipt from Acme Inc.",
    preview: "Amount paid $49.00 · Invoice #1042",
    time: "1h",
    unread: false,
  },
  {
    from: "maya.chen@gmail.com",
    name: "Maya Chen",
    subject: "Re: Can't reset my password",
    preview: "That worked, thank you for the quick reply!",
    time: "3h",
    unread: false,
  },
];

export function InboxShowcase() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Receive
        </p>
        <h2 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
          Replies land in a real inbox.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Add an MX record and inbound mail is parsed, attachments included, and
          threaded with the messages you sent. Personal and shared mailboxes
          live side by side.
        </p>
        <InboundRoutingIllustration className="mt-10 w-full max-w-md text-foreground" />
      </div>

      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-xl dark:border-white/10 dark:bg-black dark:text-white">
          <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-5 dark:border-white/10">
            <p className="text-xs font-medium">Conversations</p>
            <span className="font-mono text-[10px] text-zinc-400">
              support@acme.dev
            </span>
          </div>
          <div className="grid md:grid-cols-[1fr_1.1fr]">
            <ul className="border-zinc-200 md:border-r dark:border-white/10">
              {THREADS.map((thread, index) => (
                <li
                  key={thread.subject}
                  className={`flex gap-3 border-b border-zinc-100 p-4 last:border-0 dark:border-white/5 ${
                    index === 3 ? "bg-purple-500/[0.07]" : ""
                  }`}
                >
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`size-1.5 rounded-full ${thread.unread ? "bg-[#A855F7]" : "bg-transparent"}`}
                    />
                    <SenderAvatar
                      address={thread.from}
                      name={thread.name}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-xs ${thread.unread ? "font-semibold" : "text-zinc-600 dark:text-zinc-300"}`}
                      >
                        {thread.subject}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                        {thread.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {thread.preview}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden bg-zinc-50 p-4 md:block dark:bg-[#07080a]">
              <article className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0b0c10]">
                <header className="flex items-center gap-3 border-b border-zinc-200 p-3 dark:border-white/10">
                  <SenderAvatar
                    address="maya.chen@gmail.com"
                    name="Maya Chen"
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">Maya Chen</p>
                    <p className="truncate text-[10px] text-zinc-400">
                      to support@acme.dev
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[8px] uppercase text-zinc-400 dark:border-white/10">
                    received
                  </span>
                </header>
                <p className="p-4 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                  That worked, thank you for the quick reply! The reset link
                  arrived in seconds.
                </p>
              </article>
              <article className="mt-3 rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0b0c10]">
                <header className="flex items-center gap-3 border-b border-zinc-200 p-3 dark:border-white/10">
                  <SenderAvatar
                    address="support@multivrs.space"
                    name="Acme Support"
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">Acme Support</p>
                    <p className="truncate text-[10px] text-zinc-400">
                      to maya.chen@gmail.com
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] uppercase text-emerald-600 dark:text-emerald-400">
                    delivered
                  </span>
                </header>
                <p className="p-4 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                  Hi Maya, we just sent a fresh reset link. It expires in 30
                  minutes.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
