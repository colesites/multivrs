import type { MailView } from "@/features/mail/mail-view";

/**
 * Loading states for each mail view. Each one mirrors the layout it stands in
 * for, so content lands in place instead of jumping.
 */

const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const bar = "rounded bg-black/5 dark:bg-white/5";

const LIST_TITLES: Partial<Record<MailView, string>> = {
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

/** Rows shaped like MailThreadList's: avatar, sender and date, subject, preview. */
export function MailThreadRowsSkeleton({
  count = ROWS.length,
}: {
  count?: number;
}) {
  return (
    <div className="animate-pulse divide-y divide-black/5 dark:divide-white/5">
      {ROWS.slice(0, count).map((row) => (
        <div className="flex items-start gap-3 p-3.5 sm:pl-4" key={row}>
          <div className="mt-0.5 size-8 shrink-0 rounded-full bg-black/5 dark:bg-white/5" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <div className={`h-3 w-28 ${bar}`} />
              <div className={`h-2.5 w-10 ${bar}`} />
            </div>
            <div className={`h-2.5 w-3/4 ${bar}`} />
            <div className={`h-2.5 w-full ${bar}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A folder (Inbox, Starred, Sent…): list pane plus an empty reading pane. */
export function MailThreadListSkeleton({ view }: { view: MailView }) {
  return (
    <div
      aria-busy
      aria-label="Loading conversations"
      role="status"
      className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background dark:bg-[#07080a]"
    >
      <div className="flex h-full w-full flex-col border-r border-black/10 dark:border-white/10 md:w-80 md:shrink-0 lg:w-[360px]">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-black/10 px-4 dark:border-white/10">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {LIST_TITLES[view] ?? "Conversations"}
          </h2>
          <div className={`h-4 w-8 rounded-full ${bar}`} />
        </div>
        <MailThreadRowsSkeleton />
      </div>
      <div className="hidden flex-1 md:block" />
    </div>
  );
}

/** The reading pane while a conversation's messages load. */
export function MailReaderSkeleton() {
  return (
    <div aria-busy className="flex h-full min-h-0 flex-1 flex-col">
      <div className="h-14 shrink-0 border-b border-black/10 dark:border-white/10" />
      <div className="animate-pulse space-y-5 px-4 py-6 sm:px-8">
        <div className={`h-6 w-2/3 ${bar}`} />
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-black/5 dark:bg-white/5" />
          <div className="space-y-2">
            <div className={`h-3 w-40 ${bar}`} />
            <div className={`h-2.5 w-28 ${bar}`} />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          {ROWS.slice(0, 6).map((row) => (
            <div
              className={`h-3 ${bar} ${row === "f" ? "w-1/2" : "w-full"}`}
              key={row}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The overview's data: metrics, recent conversations, infrastructure. */
export function MailOverviewDataSkeleton() {
  return (
    <div aria-busy className="animate-pulse space-y-6 sm:space-y-8">
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 lg:grid-cols-4">
        {ROWS.slice(0, 4).map((row) => (
          <div className="bg-white p-4 dark:bg-black sm:p-5" key={row}>
            <div className={`size-4 ${bar}`} />
            <div className={`mt-3 h-7 w-20 sm:mt-5 ${bar}`} />
            <div className={`mt-2 h-3 w-16 ${bar}`} />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black">
          <div className="border-b border-black/10 p-4 dark:border-white/10">
            <div className={`h-4 w-40 ${bar}`} />
            <div className={`mt-2 h-3 w-56 ${bar}`} />
          </div>
          <MailThreadRowsSkeleton count={5} />
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black sm:p-5">
          <div className={`h-2.5 w-24 ${bar}`} />
          <div className="mt-6 space-y-5">
            {ROWS.slice(0, 3).map((row) => (
              <div
                className="flex justify-between border-b border-black/10 pb-3 dark:border-white/10"
                key={row}
              >
                <div className={`h-3 w-28 ${bar}`} />
                <div className={`h-3 w-8 ${bar}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Resource tables (domains, contacts, logs…): description and rows. */
export function MailResourceSkeleton() {
  return (
    <div
      aria-busy
      className="w-full min-w-0 max-w-full animate-pulse space-y-6 px-4 py-6 sm:px-5 sm:py-8 lg:px-8"
    >
      <div className={`h-4 w-96 max-w-full ${bar}`} />
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black">
        <div className="h-9 border-b border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
        {ROWS.slice(0, 6).map((row) => (
          <div
            className="grid grid-cols-[1.4fr_.9fr_.45fr_32px] items-center gap-3 border-b border-black/5 px-4 py-3.5 last:border-0 dark:border-white/5"
            key={row}
          >
            <div className={`h-3 w-2/3 ${bar}`} />
            <div className={`h-3 w-1/2 ${bar}`} />
            <div className={`h-5 w-14 rounded-full ${bar}`} />
            <span />
          </div>
        ))}
      </section>
    </div>
  );
}
