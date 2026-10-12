/** The overview's static introduction. Needs no data, so it never waits. */
export function MailOverviewHero() {
  return (
    <section className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(168,85,247,.12),transparent_34%),linear-gradient(130deg,#f8f9fa,#e9ecef)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(168,85,247,.12),transparent_34%),linear-gradient(130deg,#0a0a0c,#050507)] p-5 sm:p-6 md:p-8">
      <div className="pointer-events-none absolute right-8 top-8 size-24 rounded-full bg-accent/10 blur-3xl" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/70">
        Communications control plane
      </p>
      <h2 className="mt-3 max-w-xl text-xl font-medium tracking-[-0.03em] sm:text-2xl md:text-3xl break-words">
        One mailbox for product mail, support conversations, and campaigns.
      </h2>
      <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-black/45 dark:text-white/45 break-words">
        Incoming and outgoing mail share a real thread model. Delivery states
        come from provider events—not optimistic UI.
      </p>
    </section>
  );
}
